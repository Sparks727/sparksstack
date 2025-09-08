export default function GetStartedPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 space-y-8">
      <header>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Get Started</h1>
        <p className="text-muted-foreground mt-2">Styles for headings, paragraphs, lists, and more using utility classes.</p>
      </header>

      <section>
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">Headings</h2>
        <div className="space-y-4 mt-4">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">h1: The quick brown fox jumps over the lazy dog</h1>
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">h2: The quick brown fox jumps over the lazy dog</h2>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">h3: The quick brown fox jumps over the lazy dog</h3>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">h4: The quick brown fox jumps over the lazy dog</h4>
        </div>
      </section>

      <section>
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">Paragraph</h2>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Cupcake ipsum dolor sit amet gummies cheesecake jujubes marzipan sweet roll. Jelly-o brownie cotton candy tootsie roll caramels pie.
        </p>
      </section>

      <section>
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">Blockquote</h2>
        <blockquote className="mt-6 border-l-2 pl-6 italic">
          “The only way to do great work is to love what you do.”
        </blockquote>
      </section>

      <section>
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground border-b">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2">Email</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-4">Jane Cooper</td>
                <td className="py-2 pr-4">Developer</td>
                <td className="py-2">jane@company.com</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Wade Warren</td>
                <td className="py-2 pr-4">Designer</td>
                <td className="py-2">wade@company.com</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">List</h2>
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
          <li>First item</li>
          <li>Second item</li>
          <li>Third item</li>
        </ul>
      </section>

      <section>
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">Inline code</h2>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Use <code className="relative rounded bg-muted px-1 py-0.5 font-mono text-sm">npm run dev</code> to start the development server.
        </p>
      </section>

      <section>
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">Lead</h2>
        <p className="text-muted-foreground text-xl">This is a lead paragraph. It stands out from regular paragraphs.</p>
      </section>

      <section>
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">Large</h2>
        <div className="text-lg font-semibold">This is large text.</div>
      </section>

      <section>
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">Small</h2>
        <div className="text-sm text-muted-foreground">This is small text.</div>
      </section>

      <section>
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">Muted</h2>
        <div className="text-muted-foreground">Muted foreground text using the theme color.</div>
      </section>
    </div>
  );
}


