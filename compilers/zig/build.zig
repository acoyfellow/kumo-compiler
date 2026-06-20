const std = @import("std");
pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});
    const exe = b.addExecutable(.{ .name = "kumo-zig", .root_module = b.createModule(.{ .root_source_file = b.path("main.zig"), .target = target, .optimize = optimize }) });
    b.installArtifact(exe);
    const tests = b.addTest(.{ .root_module = b.createModule(.{ .root_source_file = b.path("main.zig"), .target = target, .optimize = optimize }) });
    const run = b.addRunArtifact(tests);
    const step = b.step("test", "Run unit tests");
    step.dependOn(&run.step);
}
