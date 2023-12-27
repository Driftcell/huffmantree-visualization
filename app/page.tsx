'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { HuffmanNode, calcDepth, createHuffmanTree } from '@/lib/huffman'
import Dagre from '@dagrejs/dagre'
import { useEffect, useRef, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { toast } from 'sonner'

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))

const getLayoutedElements = (nodes: any, edges: any, options: any) => {
  g.setGraph({
    rankdir: options.direction,
    ranksep: 100,
    nodesep: 200,
    edgesep: 30,
  })

  edges.forEach((edge: any) => g.setEdge(edge.source, edge.target))
  nodes.forEach((node: any) => g.setNode(node.id, node))

  Dagre.layout(g)

  return {
    nodes: nodes.map((node: any) => {
      const { x, y } = g.node(node.id)

      return { ...node, position: { x, y } }
    }),
    edges,
  }
}

export default function Home() {
  const [encodeArea, setEncodeArea] = useState('')
  const [decodeArea, setDecodeArea] = useState('')

  const [huffmanTree, setHuffmanTree] = useState<any>()
  const [map, setMap] = useState<Array<any>>([])
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // decode
  useEffect(() => {
    if (encodeArea && encodeArea.length > 0) {
      const res: any = []
      for (const word of encodeArea) {
        const v = map.find((v) => v.data && v.data === word)
        if (v) {
          res.push(v.code)
        } else {
          toast.error(`Unexpected word of "${word}"`)
          return
        }
      }
      console.log(res)
      setDecodeArea(() => res.join(''))
    }
  }, [encodeArea, map])

  useEffect(() => {
    if (decodeArea && decodeArea.length > 0) {
      const res: any = []
      let i = 0,
        j = 0
      while (i < decodeArea.length && j <= decodeArea.length) {
        const v = map.find((v) => v.code === decodeArea.substring(i, j))

        if (!v && j === decodeArea.length) {
          toast.error(`Unexpected code of "${decodeArea.substring(i, j)}"`)
          return
        }

        if (v) {
          res.push(v.data)
          i = j
        }
        j += 1
      }
      console.log(`${res}`)
      setEncodeArea(() => res.join(''))
    }
  }, [decodeArea, map])

  useEffect(() => {
    if (!huffmanTree) {
      return
    }

    // clear the encode area
    setEncodeArea('')

    const nodes = huffmanTree.nodes.map((v: HuffmanNode, i: number) => {
      const depth = calcDepth(huffmanTree.nodes, v)

      if (v.data) {
        return {
          id: v.data,
          data: {
            label: `${v.data}[${
              huffmanTree.map.find((n: HuffmanNode) => n.data === v.data).code
            }]`,
          },
          position: { x: depth * -200, y: depth * 100 },
        }
      } else {
        return {
          id: `(${v.weight})`,
          data: { label: `(${v.weight})` },
          position: { x: depth * -200, y: depth * 100 },
        }
      }
    })

    const edges: any = []
    const stack: any = []
    stack.push(huffmanTree.nodes[huffmanTree.rootIndex])

    while (stack.length != 0) {
      const node = stack.pop()
      const source = node.data ? node.data : `(${node.weight})`

      if (node?.lchild !== undefined) {
        const target = huffmanTree.nodes[node.lchild].data
          ? huffmanTree.nodes[node.lchild].data
          : `(${huffmanTree.nodes[node.lchild].weight})`
        edges.push({ id: `e${source}${target}`, source, target, label: '0' })
        stack.push(huffmanTree.nodes[node.lchild])
      }

      if (node?.rchild !== undefined) {
        const target = huffmanTree.nodes[node.rchild].data
          ? huffmanTree.nodes[node.rchild].data
          : `(${huffmanTree.nodes[node.rchild].weight})`
        edges.push({ id: `e${source}${target}`, source, target, label: '1' })
        stack.push(huffmanTree.nodes[node.rchild])
      }
    }

    console.log(nodes)
    console.log(edges)
    const layouted = getLayoutedElements(nodes, edges, { direction: 'TB' })

    setNodes(() => [...layouted.nodes])
    setEdges(() => [...layouted.edges])

    setMap(huffmanTree.map)
    console.log(huffmanTree)

    toast.success('Create Huffman Tree Successfully')
  }, [huffmanTree, setEdges, setNodes])

  const buildHuffmanTree = () => {
    const textarea = textareaRef.current?.value

    if (!textarea) {
      return
    }

    const lines = textarea.split('\n')
    const initNodes: HuffmanNode[] = []

    for (const line of lines) {
      if (line.trim() === '') {
        continue
      }

      const [data, weight] = line.split(':')

      if (isNaN(Number(weight)) || Number(weight) < 0) {
        toast.error('Error: check your format')
        return
      }

      initNodes.push({
        data,
        weight: Number(weight),
      })
    }

    const huffmanTree = createHuffmanTree(initNodes)

    setHuffmanTree(huffmanTree)
  }

  const downloadHuffman = () => {
    const blob = new Blob([JSON.stringify(huffmanTree)], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = 'huffman.json'

    document.body.appendChild(a)

    a.click()

    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importHuffman = async (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0]
      setHuffmanTree(
        JSON.parse(new TextDecoder('utf-8').decode(await file.arrayBuffer())),
      )
    }
  }

  return (
    <div className="container flex space-x-2">
      <div className="flex flex-col space-y-2 max-w-sm">
        <Label>Enter the word frequency</Label>
        <Textarea
          placeholder={`a: 1\nb: 2\nc: 3\nd:4`}
          className="flex-1"
          ref={textareaRef}
        />
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            onChange={(e) => importHuffman(e.target.files)}
            type="file"
            className="hidden"
          />
          <Button variant="ghost" onClick={() => inputRef.current?.click()}>
            Import
          </Button>
          <Button variant="outline" onClick={downloadHuffman}>
            Download
          </Button>
          <Button onClick={buildHuffmanTree}>Visualize</Button>
        </div>
        <Textarea
          value={encodeArea}
          placeholder="abcd..."
          onChange={(e) => setEncodeArea(e.target.value)}
          className="flex-1"
        />

        <Textarea
          value={decodeArea}
          placeholder="01011001..."
          onChange={(e) => setDecodeArea(e.target.value)}
          className="flex-1"
        />
      </div>
      <div className="flex flex-col space-y-2 flex-1">
        <div className="max-h-[15rem] overflow-y-scroll">
          {/* Table */}
          <Table>
            <TableCaption>Huffman Code Map</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Word</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Huffman Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {map.map((v) => (
                <TableRow key={v.data}>
                  <TableCell>{v.data}</TableCell>
                  <TableCell>{v.frequency}</TableCell>
                  <TableCell>{v.code}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            onNodesChange={onNodesChange}
            edges={edges}
            onEdgesChange={onEdgesChange}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}
