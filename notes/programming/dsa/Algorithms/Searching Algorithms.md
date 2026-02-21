


# Searching algorithm

Searching algorithms are used to locate specific items within a collection of data. 

Two most common searching algorithms. 
1. Linear Search: It is used for an unsorted array. It mainly does one by one comparison of the item to be search with array element. it take O(n) Time
2. Binary Search: It is used for a sorted array. It mainly compares the array's middle element first and if the middle is same has input, then it returns, otherwise, it searches in either the left or right half based on comparison result. It takes O(log n) time.
	- Space 
		- iterative: O(1)
		- recursion: O(log n)



## Hashing

The process of generating a small sized output (that can be used as index in a table) from a input of typically large and variable size. 

Hashing maps data
- Direct addressing: each key corresponds directly to an index.
- Hash table: stores key-value pairs
- Collisions handled via
	- chaining (linked lists)
	- open addressing (linear)