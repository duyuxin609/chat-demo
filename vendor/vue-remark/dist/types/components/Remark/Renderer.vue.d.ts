import type { AlignType, BlockContent, PhrasingContent, Root, RootContent } from 'mdast';
import type { NodeComponents } from '../../types';
type __VLS_Props = {
    node: Root | RootContent | BlockContent | PhrasingContent;
    parent?: Root | RootContent | BlockContent | PhrasingContent;
    align?: AlignType[];
    rowIndex?: number;
    colIndex?: number;
    customNodeComponents?: Partial<NodeComponents>;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
