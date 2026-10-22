import type { Node, Root } from 'mdast';
import type { Plugin } from 'unified';
export declare function parse(input: string, plugins?: Plugin<[], Root, Node>[]): Root;
