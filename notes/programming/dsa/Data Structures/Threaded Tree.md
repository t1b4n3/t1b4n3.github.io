

The idea of threaded binary trees is to make in-order traversal faster and do it without stack and recursion. A binary tree is made threaded by making all right child pointers that would be NULL point to the in-order successor of the node. (if it exists).

