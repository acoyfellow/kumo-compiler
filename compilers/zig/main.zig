const std = @import("std");
const Allocator = std.mem.Allocator;

const Framework = enum { react, vue, svelte, solid };
const Component = struct { schemaVersion: []const u8, id: []const u8, name: ?[]const u8 = null, family: ?[]const u8 = null, root: std.json.Value };
const Catalog = struct { schemaVersion: []const u8, components: []Component };
const Request = struct { schemaVersion: []const u8, inputRoot: []const u8, outputRoot: []const u8, catalog: std.json.Value, frameworks: []Framework };
const Plan = struct { component: []const u8, framework: Framework };
const Output = struct { path: []const u8, sha256: []const u8, bytes: usize };
const Diagnostic = struct { severity: []const u8 = "error", code: []const u8, message: []const u8, path: []const u8 };
const Compiler = struct { name: []const u8 = "kumo-zig-compiler", version: []const u8 = "1.0.0", toolchain: []const u8 = "Zig 0.16.0" };
const Roots = struct { input: []const u8, output: []const u8 };
const Receipt = struct { schemaVersion: []const u8 = "kumo.compiler.receipt/v1", compiler: Compiler = .{}, roots: Roots, status: []const u8, diagnostics: []const Diagnostic, plan: []const Plan, outputs: []const Output };

fn localeLess(a: []const u8, b: []const u8) bool {
    var i: usize = 0;
    while (i < a.len and i < b.len) : (i += 1) {
        const ac = std.ascii.toLower(a[i]);
        const bc = std.ascii.toLower(b[i]);
        if (ac != bc) return ac < bc;
        if (a[i] != b[i]) return a[i] < b[i];
    }
    return a.len < b.len;
}
fn lessPlan(_: void, a: Plan, b: Plan) bool {
    if (std.mem.eql(u8, a.component, b.component)) return localeLess(frameworkName(a.framework), frameworkName(b.framework));
    return localeLess(a.component, b.component);
}
fn frameworkName(f: Framework) []const u8 {
    return @tagName(f);
}
fn safeId(id: []const u8) bool {
    if (id.len == 0 or std.mem.eql(u8, id, ".") or std.mem.eql(u8, id, "..")) return false;
    for (id) |c| if (!(std.ascii.isAlphanumeric(c) or c == '-' or c == '_')) return false;
    return true;
}
fn isAbsolute(p: []const u8) bool {
    return std.fs.path.isAbsolute(p);
}
fn hasTraversal(p: []const u8) bool {
    var it = std.mem.splitAny(u8, p, "/\\");
    while (it.next()) |x| if (std.mem.eql(u8, x, "..")) return true;
    return false;
}
fn digestHex(allocator: Allocator, body: []const u8) ![]const u8 {
    var digest: [32]u8 = undefined;
    std.crypto.hash.sha2.Sha256.hash(body, &digest, .{});
    return try std.fmt.allocPrint(allocator, "{x}", .{digest});
}
fn jsonAlloc(allocator: Allocator, value: anytype) ![]u8 {
    return try std.fmt.allocPrint(allocator, "{f}", .{std.json.fmt(value, .{})});
}
fn errReceipt(allocator: Allocator, roots: Roots, code: []const u8, message: []const u8, path: []const u8) !Receipt {
    const ds = try allocator.alloc(Diagnostic, 1);
    ds[0] = .{ .code = code, .message = message, .path = path };
    return .{ .roots = roots, .status = "error", .diagnostics = ds, .plan = &.{}, .outputs = &.{} };
}
fn emit(io: std.Io, receipt: Receipt) !void {
    const body = try jsonAlloc(std.heap.page_allocator, receipt);
    defer std.heap.page_allocator.free(body);
    var buffer: [4096]u8 = undefined;
    var w = std.Io.File.stdout().writer(io, &buffer);
    try w.interface.writeAll(body);
    try w.interface.writeByte('\n');
    try w.interface.flush();
}

pub fn main(init: std.process.Init) !void {
    const a = init.gpa;
    const io = init.io;
    var args = std.process.Args.Iterator.init(init.minimal.args);
    _ = args.next();
    const req_path = args.next() orelse {
        try emit(io, try errReceipt(a, .{ .input = "unknown", .output = "unknown" }, "malformed-request", "expected one positional request file", "$"));
        std.process.exit(1);
    };
    if (args.next() != null) {
        try emit(io, try errReceipt(a, .{ .input = "unknown", .output = "unknown" }, "malformed-request", "expected one positional request file", "$"));
        std.process.exit(1);
    }
    const bytes = std.Io.Dir.cwd().readFileAlloc(io, req_path, a, .limited(64 * 1024 * 1024)) catch {
        try emit(io, try errReceipt(a, .{ .input = "unknown", .output = "unknown" }, "malformed-request", "cannot read request file", "$"));
        std.process.exit(1);
    };
    const parsed = std.json.parseFromSlice(Request, a, bytes, .{ .ignore_unknown_fields = false, .allocate = .alloc_always }) catch {
        try emit(io, try errReceipt(a, .{ .input = "unknown", .output = "unknown" }, "malformed-request", "invalid request JSON", "$"));
        std.process.exit(1);
    };
    const req = parsed.value;
    const roots = Roots{ .input = req.inputRoot, .output = req.outputRoot };
    if (!std.mem.eql(u8, req.schemaVersion, "kumo.compiler.request/v1")) {
        try emit(io, try errReceipt(a, roots, "unsupported-protocol", "expected kumo.compiler.request/v1", "$.schemaVersion"));
        std.process.exit(1);
    }
    if (!isAbsolute(req.inputRoot) or !isAbsolute(req.outputRoot)) {
        try emit(io, try errReceipt(a, roots, "absolute-root-required", "roots must be absolute", "$.inputRoot"));
        std.process.exit(1);
    }
    var catalog_bytes: []const u8 = undefined;
    if (req.catalog == .string) {
        const rel = req.catalog.string;
        if (isAbsolute(rel) or hasTraversal(rel)) {
            try emit(io, try errReceipt(a, roots, "path-escape", "catalog escapes input root", "$.catalog"));
            std.process.exit(1);
        }
        const p = try std.fs.path.join(a, &.{ req.inputRoot, rel });
        catalog_bytes = std.Io.Dir.cwd().readFileAlloc(io, p, a, .limited(64 * 1024 * 1024)) catch {
            try emit(io, try errReceipt(a, roots, "invalid-catalog", "cannot read catalog", "$.catalog"));
            std.process.exit(1);
        };
    } else catalog_bytes = try jsonAlloc(a, req.catalog);
    const cp = std.json.parseFromSlice(Catalog, a, catalog_bytes, .{ .ignore_unknown_fields = true, .allocate = .alloc_always }) catch {
        try emit(io, try errReceipt(a, roots, "invalid-catalog", "invalid catalog JSON", "$.catalog"));
        std.process.exit(1);
    };
    const catalog = cp.value;
    if (!std.mem.eql(u8, catalog.schemaVersion, "kumo.ir/v1") or catalog.components.len != 41) {
        try emit(io, try errReceipt(a, roots, "invalid-catalog", "expected kumo.ir/v1 catalog with 41 components", "$.catalog"));
        std.process.exit(1);
    }
    for (catalog.components, 0..) |c, i| {
        if (!std.mem.eql(u8, c.schemaVersion, "kumo.ir/v1") or !safeId(c.id)) {
            const p = try std.fmt.allocPrint(a, "$.catalog.components[{d}]", .{i});
            try emit(io, try errReceipt(a, roots, "invalid-component", "invalid component record", p));
            std.process.exit(1);
        }
        for (catalog.components[0..i]) |prior| {
            if (std.mem.eql(u8, prior.id, c.id)) {
                const p = try std.fmt.allocPrint(a, "$.catalog.components[{d}].id", .{i});
                try emit(io, try errReceipt(a, roots, "duplicate-component", "duplicate component id", p));
                std.process.exit(1);
            }
        }
    }
    if (req.frameworks.len == 0) {
        try emit(io, try errReceipt(a, roots, "invalid-frameworks", "at least one framework required", "$.frameworks"));
        std.process.exit(1);
    }
    for (req.frameworks, 0..) |f, i| {
        for (req.frameworks[0..i]) |x| {
            if (x == f) {
                try emit(io, try errReceipt(a, roots, "invalid-frameworks", "duplicate framework", "$.frameworks"));
                std.process.exit(1);
            }
        }
    }
    const plan = try a.alloc(Plan, catalog.components.len * req.frameworks.len);
    var n: usize = 0;
    for (catalog.components) |c| for (req.frameworks) |f| {
        plan[n] = .{ .component = c.id, .framework = f };
        n += 1;
    };
    std.mem.sort(Plan, plan, {}, lessPlan);
    const stage = try std.fmt.allocPrint(a, "{s}.kumo-zig-stage-{d}", .{ req.outputRoot, std.Thread.getCurrentId() });
    std.Io.Dir.cwd().deleteTree(io, stage) catch {};
    try std.Io.Dir.cwd().createDirPath(io, stage);
    var outputs = try a.alloc(Output, plan.len);
    for (plan, 0..) |item, i| {
        var comp: Component = undefined;
        for (catalog.components) |c| if (std.mem.eql(u8, c.id, item.component)) {
            comp = c;
            break;
        };
        const root_json = try jsonAlloc(a, comp.root);
        const body = try std.fmt.allocPrint(a, "{{\"schemaVersion\":\"kumo.compiler.artifact/v1\",\"component\":\"{s}\",\"framework\":\"{s}\",\"ir\":{s}}}\n", .{ item.component, frameworkName(item.framework), root_json });
        const rel = try std.fmt.allocPrint(a, "artifacts/{s}/{s}.json", .{ item.component, frameworkName(item.framework) });
        const parent = try std.fmt.allocPrint(a, "{s}/artifacts/{s}", .{ stage, item.component });
        try std.Io.Dir.cwd().createDirPath(io, parent);
        const full = try std.fs.path.join(a, &.{ stage, rel });
        try std.Io.Dir.cwd().writeFile(io, .{ .sub_path = full, .data = body });
        outputs[i] = .{ .path = rel, .sha256 = try digestHex(a, body), .bytes = body.len };
    }
    std.mem.sort(Output, outputs, {}, struct {
        fn less(_: void, x: Output, y: Output) bool {
            return localeLess(x.path, y.path);
        }
    }.less);
    std.Io.Dir.cwd().deleteTree(io, req.outputRoot) catch {};
    std.Io.Dir.renameAbsolute(stage, req.outputRoot, io) catch {
        std.Io.Dir.cwd().deleteTree(io, stage) catch {};
        try emit(io, try errReceipt(a, roots, "compiler-failure", "atomic output commit failed", "$.outputRoot"));
        std.process.exit(1);
    };
    try emit(io, .{ .roots = roots, .status = "ok", .diagnostics = &.{}, .plan = plan, .outputs = outputs });
}

test "traversal and ids" {
    try std.testing.expect(hasTraversal("a/../b"));
    try std.testing.expect(!hasTraversal("a/b"));
    try std.testing.expect(safeId("date-picker"));
    try std.testing.expect(!safeId("../x"));
}
test "deterministic sha256" {
    const h = try digestHex(std.testing.allocator, "abc");
    defer std.testing.allocator.free(h);
    try std.testing.expectEqualStrings("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", h);
}
test "JSON decode" {
    const p = try std.json.parseFromSlice(Request, std.testing.allocator, "{\"schemaVersion\":\"kumo.compiler.request/v1\",\"inputRoot\":\"/i\",\"outputRoot\":\"/o\",\"catalog\":{},\"frameworks\":[\"react\"]}", .{});
    defer p.deinit();
    try std.testing.expectEqual(@as(usize, 1), p.value.frameworks.len);
}
test "diagnostic shape" {
    const r = try errReceipt(std.testing.allocator, .{ .input = "x", .output = "y" }, "path-escape", "bad", "$.catalog");
    defer std.testing.allocator.free(r.diagnostics);
    try std.testing.expectEqualStrings("$.catalog", r.diagnostics[0].path);
}
