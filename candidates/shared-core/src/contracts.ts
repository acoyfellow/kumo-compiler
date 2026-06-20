export type Component='button'|'field'|'tabs'|'select'|'dialog'|'popover'|'date-picker';
export interface NativeViewBoundary { portal?(node:unknown):unknown; focus?(id:string):void; restoreFocus?():void; onNativeEvent?(event:unknown):void }
export const components:readonly Component[]=['button','field','tabs','select','dialog','popover','date-picker'];
