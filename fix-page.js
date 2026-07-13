const fs = require('fs');
fs.writeFileSync(
  'C:/Users/aravind/Downloads/erp fn/vistral-erp/src/app/page.tsx',
  `import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/dashboard");
}
`,
  'utf8'
);
console.log('Done');
