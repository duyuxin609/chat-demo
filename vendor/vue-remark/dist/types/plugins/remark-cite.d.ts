import type { Plugin } from 'unified';
import type { Data, Literal } from 'mdast';
export interface Cite extends Literal {
    type: 'cite';
    data?: CiteData | undefined;
}
export interface CiteData extends Data {
}
declare module 'mdast' {
    interface PhrasingContentMap {
        cite: Cite;
    }
    interface RootContentMap {
        cite: Cite;
    }
}
declare function tokenizeCite(effects: any, ok: any, nok: any): (code: any) => any;
export declare function citeHtml(): {
    text: {
        91: {
            name: string;
            tokenize: typeof tokenizeCite;
        };
    };
};
export declare function citeFromMarkdown(): {
    enter: {
        cite: typeof enterCite;
    };
    exit: {
        cite: typeof exitCite;
        citeText: typeof exitCiteText;
    };
};
declare function enterCite(this: any, token: any): void;
declare function exitCite(this: any, token: any): void;
declare function exitCiteText(this: any, token: any): void;
export declare function citeToMarkdown(): {
    handlers: {
        cite: typeof handleCite;
    };
};
declare function handleCite(node: Cite): string;
declare const remarkCite: Plugin<[]>;
export default remarkCite;
