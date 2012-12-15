/**
 *  MooPack Tree, a DHTML Tree plugin for MooTools
 *  © 2012 Mohsen Khahani
 *
 *  Licensed under the MIT license
 *  Created on December 13, 2012
 *
 *  http://mohsen.khahani.com/moopack
 */


/**
 * MooPack Tree base class
 */
MooPack.Tree = new Class({

    version: '1.0dev',

	Implements: Options,

    options: {
        baseClass   : 'moopack-tree',
        interactive : true,
        checkboxes  : false,
        rootNode    : false,
        nodeSelect  : true
    },

    /**
     * Initiates the tree
     *
     * @target  JS Object/String        Target element(ID) as tree container
     * @options ProtopackTreeOptions    Tree options: {baseClass, checkboxes}
     * @events  JS Object               Tree events: {nodeclick, nodemouseover, nodemouseout}
     *
     * @return  JS Object               A class instance of Tree 
     */
    initialize: function(target, options, events) {
        this.setOptions(options);
		Object.append(this, {
            baseClass   : this.options.baseClass,
            interactive : this.options.interactive,
            checkboxes  : this.options.checkboxes,
            selected    : (this.checkboxes)? [] : null
        });
        this.events = events || {};
        this.dataById = {};
        this.nodeById = {};
        this.element = this.construct();
        this.nodeOptions = {
            checkboxes:  this.checkboxes, 
            interactive: this.interactive
        };
        this.nodeEvents = {
            click:  this.onNodeClick.bind(this),
            over:   this.onNodeOver.bind(this),
            out:    this.onNodeOut.bind(this),
            toggle: this.toggleNode.bind(this)
        };
        if (target) {
            $(target).update(this.element);
        }
        // default checked inputs does not work on IE6
        //if (Prototype.Browser.IE6) {
            //this._refresh.bind(this).delay(0.1);
        //}
    },

    toElement: function() {
        return this.element;
    },

    /**
     * Tree constructor
     *
     * @return  String      XHTML tree
     */
    construct: function() {
        return new Element('div', {'class': this.baseClass});
    },

    /**
     * Loads data and builds the tree
     *
     * @param   data    Array   Array of nodes which each node is an array itself
     *                          node: [id:int, pid:int, text:string, data:Obj]
     *
     * @return  void
     */
    loadData: function(data) {
        function buildTree(parent, nodeObj) {
            var store = data.partition(function(row) {
                return row[1] == parent;
            });
            data = store[1];
            store[0].each(function(row) {
                var node = nodeObj.addNode(row[0], row[1], row[2], row[3] || null);
                nodeById[row[0]] = node;
                if (data.length > 0) {
                    buildTree(row[0], node);
                }
            });
        }
        var root = new MooPack.Tree.Node(0, -1, 'root'),
            nodeById = {},
            tree;

        // data.each( function(row, i) {
            // this.dataById[row[0]] = row;
        // }, this);
        // this.rawData = data;

        buildTree(0, root);
        //this.dataObj = root;
        this.nodeById = nodeById;
        this.root = root;

        if (this.options.rootNode) {
            tree = this.treeFrom([root]);
        } else {
            tree = this.treeFrom(root.nodes);
        }
        if (!this.interactive) {
            this.expandAll(root);
        }
        this.element.update(tree);
    },

    treeFrom: function(nodes) {
        var ul = new Element('ul');
        //nodes.sort( function(n1, n2) {return n1.data.seq - n2.data.seq;} );
        nodes.each( function(node, i) {
                nodeEl = node.toElement(this.nodeOptions, this.nodeEvents),
                nodeDiv = nodeEl.getElement('div');
            nodeDiv.addClass(this.baseClass + '-node');
            // if (this.checkboxes) {
                // if (node.data.checked) {
                    // this.selected.push(node.id);
                // }
            // }
            if (this.interactive && node.nodes.length !== 0) {
                nodeEl.getElement('span').addClass('plus');
            }
            ul.grab(nodeEl);
            this.nodeById[node.id] = node;
        }, this);

        return ul;
    },

//=================================================================================================
// API
//=================================================================================================
    getNode: function(id) {
        return this.nodeById[id];
    },

    expandNode: function(node, recursive) {
        if (node.nodes.length === 0) {
            return;
        }

        var ul = node.element.getElement('ul');
        if (!ul) {
            ul = this.treeFrom(node.nodes);
            node.element.grab(ul);
        } else {
            ul.show();
        }
        if (this.interactive) {
            node.expander.className = 'minus';
        }

        if (recursive) {
            node.nodes.each(function(childNode) {
                this.expandNode(childNode, true);
            }, this);
        }
    },

    collapseNode: function(node, recursive) {
        if (node.nodes.length === 0 || !node.element) {
            return;
        }

        var ul = node.element.getElement('ul');
        if (!ul) {
            return;
        }
        ul.hide();
        node.expander.className = 'plus';

        if (recursive) {
            node.nodes.each(function(childNode) {
                this.collapseNode(childNode, true);
            }, this);
        }
    },

    toggleNode: function(node) {
        var ul = node.element.getElement('ul');
        if (!ul) {
            ul = this.treeFrom(node.nodes);
            node.element.grab(ul);
            node.expander.className = 'minus';
        } else {
            if (ul.isDisplayed()) {
                ul.hide();
                node.expander.className = 'plus';
            } else {
                ul.show();
                node.expander.className = 'minus';
            }
        }
    },

    expandAll: function(node) {
        if (!node) {
            node = this.root;
        }
        if (node.element) {
            this.expandNode(node, true);
        } else {
            node.nodes.each(function(nd) {
                this.expandNode(nd, true);
            }, this);
        }
    },

    collapseAll: function(node) {
        if (!node) {
            node = this.root;
        }
        if (node.element) {
            this.collapseNode(node, true);
        } else {
            node.nodes.each(function(nd) {
                this.collapseNode(nd, true);
            }, this);
        }
    },

    _render: function() {
        if (!this.interactive) {
            return;
        }
        var nodes = this.element.select('div');
        nodes.each(function(node) {
            if (node.next()) {
                if (node.next().visible()) {
                    node.previous('span').baseClass = 'minus';
                } else {
                    node.previous('span').baseClass = 'plus';
                }
            } else {
                node.previous('span').baseClass = 'l';
            }
        });
    },

    _refresh: function() {
        this.data.each( function(row, index) {
            var inputs = this.element.select('input[type=checkbox][value=' + row[0] + ']');
                checked = row[3]? row[3]['checked'] : false;
            inputs[0].checked = checked;
        }.bind(this));
    },

    _sort: function(node1, node2) {
        var n1 = node1[2].toLowerCase(),
            n2 = node2[2].toLowerCase(),
            res = 0;

        if (n1 > n2) {
            res = 1;
        } else if (n1 < n2) {
            res = -1;
        }

        return res;
    },

    /**
     * selects/checks node and updates `tree.selected`
     */
    onNodeClick: function(node) {
        if (this.options.nodeSelect) {
            this.clearSelection();
            this.selectNode(node);
        }
        this.selected = node;
    },

    /**
     * Adds `hover` class to the node
     */
    onNodeOver: function(node) {
        node.element.getElement('div').addClass('hover');
    },

    /**
     * Removes `hover` class from the node
     */
    onNodeOut: function(node) {
        node.element.getElement('div').removeClass('hover');
    },

    /**
     * Empties `tree.selected` and clears selected/checked nodes
     */
    clearSelection: function() {
        if (this.checkboxes) {
            this.selected.each(function(id) {
                this.dataById[id].data.checked = false;
                this.dataById[id].div.getElement('input').checked = false;
            }.bind(this));
            this.selected.clear();
        } else {
            if (this.selected) {
                this.selected.container.removeClass('selected');
            }
            this.selected = null;
        }
    },

    /**
     * Highlights/checks node
     */
    selectNode: function(node) {
        if (this.checkboxes) {
            var checked = this.dataById[id].data.checked,
                i = this.selected.indexOf(id);
            if (checked) {
                this.selected.splice(i, 1);
            } else if (i === -1) {
                this.selected.push(id);
            }
            this.dataById[id].data.checked = !checked;
            this.dataById[id].div.getElement('input').checked = !checked;
        } else {
            node.container.addClass('selected');
        }
    },

    /**
     * Updates `tree.selected` and selects/checks appropriate node(s)
     */
    select: function(sel) {
        if (this.checkboxes) {
            function doSelect(id) {
                this.dataById[id].data.checked = true;
                this.dataById[id].node.getElement('input').checked = true;
            };
            this.clearSelection();
            if (Object.isArray(sel)) {
                sel = sel.uniq();
                sel.each(doSelect, this);
                this.selected = sel;
            } else {
                this.selected = [sel];
                doSelect.call(this, sel);
            }
        } else {
            this.selected = sel;
            this.selectNode(sel);
        }
    },

    insertNode: function(node) {
        this.data.push(node);
        this.reload();
    },

    deleteNode: function(id) {
        var index = this._getNodeIndex(id);
        if (index != -1) {
            this.data.splice(index, 1);
            this.reload();
        }
    },

    updateNode: function(id, node) {
        var index = this._getNodeIndex(id);
        if (index != -1) {
            this.data.splice(index, 1);
        }
        this.insertNode(node);
    },

    hasChild: function(id) {
        var res = false;
        this.data.each( function(node) {
            if (node[1] == id) {
                res = true;
                throw $break;
            }
        });
        return res;
    },

    numberOfChildren: function(id) {
        var count = 0
        this.data.each( function(node) {
            if (node[1] == id) {
                count++
            }
        });
        return count;
    },

    setId: function(id) {
        this.element.id = id;
    },

    setCaption: function(caption) {
        if (this.caption) {
            this.caption.update(caption);
        } else {
            //rootNode = new MooPack.Tree.Node(this.checkboxes, this.caption);
            this.caption = new Element('div', {'class': this.baseClass + '-caption'}).update(caption);
            this.element.insert({before: this.caption});
        }
        return this.caption;
    }

});
