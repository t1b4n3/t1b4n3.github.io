
A binary search tree is a type of binary tree data structure in which each node contains a unique key and satisfies a specific ordering property:

- All nodes in the left subtree of a node must contain values less than the node's value.
- All nodes in the right subtree of a node must contain values greater than the node's value.




## Operations

###  Search 

- Find whether a given key exists.
- Time complexity:
	- avg: `0(logn)`
	- worst case: `O(n)`

### Insertion

Insert a new node while maintaining binary search tree property

- Compare key with current node and move left/right recursively or iteratively.
- Time Complexity:
	- avg: `O(log n)`
	- worst case: `O(n)`

### Deletion

 Remove a node while keeping binary search tree valid.

- Node has no children then remove directly.
- Node has one child replace node with its child.

- Node has two children means replace node with in-order successor/predecessor and delete that successor/predecessor.
- Time Complexity:
	- avg: `O(log n)`
	- worst case: `O(n)`


### Traversal

- In-Order
	- (Left, Root, Right)
- Pre-Order
	- (Root, Left, Right)
- Post-Order
	- (Left, Right, Root)
- Level-Order
	- Traverse the tree level by level using  a queue.
-

## Application of binary search tree.

- Searching and indexing
- Dynamic sorting and range queries
- Implementing symbol tables in compilers
- Used in advanced structures.