import type { NodeComponents } from '@futuregene/vue-remark'
import Blockquote from './Blockquote.vue'
import Cite from './Cite.vue'
import Code from './Code.vue'
import Heading from './Heading.vue'
import InlineCode from './InlineCode.vue'
import InlineMath from './InlineMath.vue'
import Link from './Link.vue'
import LinkReference from './LinkReference.vue'
import List from './List.vue'
import ListItem from './ListItem.vue'
import Math from './Math.vue'
import Paragraph from './Paragraph.vue'
import Table from './Table.vue'
import TableCell from './TableCell.vue'
import TableRow from './TableRow.vue'
import Teleport from './Teleport.vue'
import ThematicBreak from './ThematicBreak.vue'

// 与 epsilon-web 完全一致的 17 个自定义节点
export default {
  heading: Heading,
  paragraph: Paragraph,
  list: List,
  listItem: ListItem,
  link: Link,
  inlineCode: InlineCode,
  code: Code,
  blockquote: Blockquote,
  thematicBreak: ThematicBreak,
  table: Table,
  tableRow: TableRow,
  tableCell: TableCell,
  math: Math,
  inlineMath: InlineMath,
  linkReference: LinkReference,
  teleport: Teleport,
  cite: Cite,
} as Partial<NodeComponents>
