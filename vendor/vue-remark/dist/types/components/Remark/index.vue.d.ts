import type { Node, Root } from 'mdast';
import type { Plugin } from 'unified';
import type { NodeComponents } from '../../types';
type __VLS_Props = {
    markdown: string;
    allowDangerousHtml?: boolean;
    components?: Partial<NodeComponents>;
    plugins?: Plugin<[], Root, Node>[];
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
