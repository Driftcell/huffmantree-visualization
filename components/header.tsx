import { Network } from 'lucide-react'

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex space-x-2">
          <Network />
          <span>Visual Huffman Tree Made by Helio at 2023/12/26</span>
        </div>
      </div>
    </header>
  )
}
