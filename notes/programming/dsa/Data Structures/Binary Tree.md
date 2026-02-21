
A Binary Tree data structure is a non-linear and hierarchical data structure in which each node has at most two children, referred to as left child and right child.  The top most node is called **root** and the bottom nodes (having no children) are called **leaves**.

It is commonly used for efficient storage and retrieval of data, with various operations such as insertion, deletion and traversal.


## Representation

Each node has three parts:
- Data
- pointer to the left child
- pointer to the right child


## Advantages

- Efficient search: Binary search tree (a variation of binary tree) is efficient when searching for specific element, as each node has at most two child nodes when compared to linked list and arrays
- Memory efficient: Require lesser memory as compared to other tree data structures.
- Easy to understand and implement.

## Disadvantages
- Limited structure: binary trees are limited to two child nodes per node, which can limit their usefulness in certain applications.
- Space inefficiency: Each node requires two child pointers, which can be a significant amount of memory for large trees.

## Applications of Binary Tree.

- Used to represent hierarchical data.
- Huffman coding trees are used in data compression algorithms
- Useful for indexing segmented at the database is useful in storing cache in the system.
- Used to implement decision trees (algorithm used for classification and regression analysis)