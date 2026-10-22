import type { Plugin } from 'unified';
import type { Data, Literal } from 'mdast';
export interface Teleport extends Literal {
    type: 'teleport';
    data?: TeleportData | undefined;
}
export interface TeleportData extends Data {
}
declare module 'mdast' {
    interface RootContentMap {
        teleport: Teleport;
    }
    interface BlockContentMap {
        teleport: Teleport;
    }
}
declare function tokenizeTeleport(effects: any, ok: any, nok: any): (code: any) => any;
export declare function teleportHtml(): {
    flow: {
        45: {
            name: string;
            tokenize: typeof tokenizeTeleport;
        };
    };
};
export declare function teleportFromMarkdown(): {
    enter: {
        teleport: typeof enterTeleport;
    };
    exit: {
        teleport: typeof exitTeleport;
        teleportText: typeof exitTeleportText;
    };
};
declare function enterTeleport(this: any, token: any): void;
declare function exitTeleport(this: any, token: any): void;
declare function exitTeleportText(this: any, token: any): void;
export declare function teleportToMarkdown(): {
    handlers: {
        teleport: typeof handleTeleport;
    };
};
declare function handleTeleport(node: Teleport): string;
declare const remarkTeleport: Plugin<[]>;
export default remarkTeleport;
