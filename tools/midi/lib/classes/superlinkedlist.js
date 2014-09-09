var SuperLinkedList = function() {
    var self = this

    var arrIndex = []

    self.First = null
    self.Last = null

    self.Current = null

    var ensureNode = function(data) {
        // if (!!(data instanceof LinkedListItem)) {
        //     data = new LinkedListItem(data)
        // }
        if (!data.hasOwnProperty("Prev") && !data.hasOwnProperty("Next")) {
            data = new LinkedListItem(data)
        }
        return data
    }

    function attachNodes(node1, node2) {
        node1.Next = node2
        node2.Prev = node1
    }

    self.length = function() {
        return arrIndex.length
    }

    self.push = function(newNode) {
        newNode = ensureNode(newNode)

        if (!arrIndex.length) {
            self.First = newNode
            self.Last = newNode
            // newNode.Next = newNode
            // newNode.Prev = newNode
            self.Current = newNode
        }
        else {
            self.Last.Next = newNode
            newNode.Prev = self.Last
            self.Last = newNode
            // newNode.Next = self.First
        }
        // self.Current = newNode
        arrIndex.push(newNode)

        return newNode
    }

    self.pop = function() {
        if (arrIndex.length) {
             var node = arrIndex.pop()
             var prev = node.Prev
             if (!!node.Next) {
                // node.Next.Prev = prev
                // prev.Next = node.Next
             }
             
             if (!!prev) {
                // prev.Next = node.Next
                prev.Next = null
                self.Last = prev
             } else {
                self.First = self.Last = self.Current = null
             }
             node.Next = node.Prev = null
             return node
        }
        return undefined
    }

    self.shift = function() {
        if (arrIndex.length) {
             var node = arrIndex.shift()
             var next = node.Next
             if (!!node.Prev) {
                // node.Prev.Next = next
                // next.Prev = node.Prev
             }

             if (!!next) {
                next.Prev = null
                self.First = next
             } else {
                self.First = self.Last = self.Current = null
             }
             node.Next = node.Prev = null
             return node
        }
        return undefined
    }

    self.unshift = function(newNode) {
        newNode = ensureNode(newNode)

        if (arrIndex.length) {
            this.insertBefore(self.First, newNode)
        } else {
            self.push(newNode)
        }
        return newNode
    }

    self.removeAt = function(n) {
        if (n < 0 || n > arrIndex.length - 1) return undefined;
        var node = self.at(n)
        var prev = node.Prev
        if (!!prev) {
            prev.Next = node.Next
            if (!!node.Next) {
                node.Next.Prev = prev
                if (node === self.First) {
                    self.First = prev.Next
                }
                if (node === self.Current) {
                    self.Current = node.Next
                }
            }
            if (!!node.Prev) {
                node.Prev.Next = node.Next
                if (node === self.Last) {
                    self.Last = prev
                }
                if (node === self.Current) {
                    self.Current = node.Prev
                }
            }
        }
        arrIndex.splice(n, 1)
        node.Next = node.Prev = null
        return node
    }

    self.insertAt = function(n, newNode) {
        if (n < 0 || n > arrIndex.length - 1) return;
        if (arrIndex.length) {
            self.insertBefore(self.at(n), newNode);
        } else {
            self.push(newNode)
        }
        return newNode
    }

    self.insertBefore = function(loc, node) {
        if (!arrIndex.length) return;
        node = ensureNode(node)

        if (!loc) {
            self.push(node)
            return
        }

        var prev = loc.Prev
        attachNodes(node, loc)
        node.Prev = prev
        if (!!prev) {
            prev.Next = node
        }
        
        if (loc === self.First) {
            self.First = node
        }
        return node
    }

    self.insertAfter = function(loc, node) {
        if (!arrIndex.length) return;
        node = ensureNode(node)

        var next = loc.Next
        attachNodes(loc, node)
        node.Next = next
        if (!!next) {
            next.Prev = node
        }
        
        if (loc === self.Last) {
            self.Last = node
        }
        return node
    }

    self.removeOne = function(node) {
        if (!arrIndex.length) return;
        if (!!node) {
            var prev = node.Prev
            if (!!node.Next) {
                node.Next.Prev = prev
            }
            if (!!prev) {
                prev.Next = node.Next
            }

            if (node === self.First) {
                self.First = node.Next
            }
            if (node === self.Last) {
                self.Last = node.Prev
            }
            if (node === self.Current) {
                self.Current = node.Next
            }
            node.Next = node.Prev = null
        }
    }

    self.remove = function(data) {
        var currentNode = self.First

        if (arrIndex.length == 0) {
            return
        }

        var wasDeleted = false

        /* Are we deleting the first node? */
        if (data == currentNode.Value) {

            /* Only one node in list, be careful! */
            if (currentNode.Next == null) {
                self.First = null
                self.Last = null
                arrIndex.shift()
                return
            }

            currentNode.Value = null
            currentNode = currentNode.Next
            self.First = currentNode
            arrIndex.shift()
            return
        }

        var index = 1

        while (true) {
            /* If end of list, stop */
            if (currentNode == null) {
                wasDeleted = false
                break
            }

            /* Check if the data of the next is what we're looking for */
            var nextNode = currentNode.Next
            if (nextNode != null) {
                if (nextNode == self.First){
                    break;
                }
                if (data == nextNode.Value) {

                    /* Found the right one, loop around the node */
                    self.removeAt(index)
                    break
                }
            }

            ++index
        }
    }

    self.at = function(n) {
        if (n < 0 || n >= arrIndex.length) return undefined
        return arrIndex[n]
    }

    self.indexOf = function(data) {
        var currentNode = self.First;
        var position = 0;
        var found = false;

        for (; ; position++) {
            if (currentNode == null) {
                break;
            }

            if (data == currentNode.Value) {
                found = true;
                break;
            }

            currentNode = currentNode.Next;
        }

        if (!found) {
            position = -1;
        }

        return position;
    }
}

var LinkedListItem = function(data) {
    var self = this

    self.Value = data

    self.Next = null
    self.Prev = null
}

exports.LinkedList = SuperLinkedList
exports.LinkedListItem = LinkedListItem