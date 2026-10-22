import type { Plugin } from 'unified';
import type { Parent, Root, RootContent } from 'mdast';
type Depth = 1 | 2 | 3 | 4 | 5 | 6;
export interface Section extends Parent {
    type: 'section';
    depth: Depth;
    heading: RootContent;
}
declare module 'mdast' {
    interface RootContentMap {
        section: Section;
    }
}
declare const remarkSection: Plugin<[], Root>;
export default remarkSection;
