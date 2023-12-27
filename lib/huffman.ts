export interface HuffmanNode {
  data?: string
  weight: number
  parent?: number
  lchild?: number
  rchild?: number
}

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const findMin2 = (nodes: HuffmanNode[]) => {
  return nodes
    .map((v, i) => {
      return { i, v: v }
    })
    .filter((n) => n.v.parent === undefined)
    .sort((a, b) => a.v.weight - b.v.weight)
    .map((v) => v.i)
    .slice(0, 2)
}

export const calcDepth = (nodes: HuffmanNode[], v: HuffmanNode) => {
  const stack: any = []
  stack.push({ ...nodes[nodes.length - 1], depth: 0 })
  while (stack.length != 0) {
    const node = stack.pop()
    const {depth, ...inode} = node
    if (JSON.stringify(inode) === JSON.stringify(v)) {
      console.log(node)
      console.log(v)
      return depth
    }

    if (node?.lchild !== undefined) {
      stack.push({ ...nodes[node.lchild], depth: node.depth + 1 })
    }

    if (node?.rchild !== undefined) {
      stack.push({ ...nodes[node.rchild], depth: node.depth + 1 })
    }
  }
  return 0
}

export const createHuffmanTree = (nodes: HuffmanNode[]) => {
  while (nodes.filter((n) => n.parent === undefined).length != 1) {
    const [m1, m2] = findMin2(Array.from(nodes))
    nodes.push({
      weight: nodes[m1].weight + nodes[m2].weight,
      lchild: m1,
      rchild: m2,
    })

    nodes[m1].parent = nodes.length - 1
    nodes[m2].parent = nodes.length - 1
  }

  const map = []
  const stack: any = []

  stack.push({ ...nodes[nodes.length - 1], code: '' })
  while (stack.length != 0) {
    const node = stack.pop()

    if (node?.data) {
      map.push({ data: node.data, code: node.code, frequency: node.weight })
    }

    if (node?.lchild !== undefined) {
      stack.push({ ...nodes[node.lchild], code: node.code + '0' })
    }

    if (node?.rchild !== undefined) {
      stack.push({ ...nodes[node.rchild], code: node.code + '1' })
    }
  }

  map.sort((a, b) => b.frequency - a.frequency)

  return { nodes, rootIndex: nodes.length - 1, map }
}
