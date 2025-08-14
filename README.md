# My inspector
<img width="600" height="450" alt="Image" src="https://github.com/user-attachments/assets/38411527-6002-4803-a1ca-9a81fcbb5c4e" />

#### 1. We could see the AST in treview, select node in treeview or preview will let us edit its in CSS Inspector.
#### 2. Algorithm for indicating reuseable components
 For every `Div` node, I try to build a serialize for it, nodes are same serialize, same structure ,will be grouped.

 Example: With AST in above images, we have that map:
 ```code
{
  "T(Div)[T(Text)[]]": ["card-0"],
  "T(Div)[T(Text)[],T(Image)[]]": ["card-1", "card-2"]
}
```
=> card-1, card-2 have same structure, should be grouped to 1 component (C1)

# Get started
App build by  `vite`  with `react`, `typescipt`, `tailwind` , deploy by `vercel`