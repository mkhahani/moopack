/**
 *  MooPack Tree, a DHTML Tree plugin for MooTools
 *  � 2012 Mohsen Khahani
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
        nodeSelect  : true,
        rootNode    : false,
        sortBy      : false  // 'id', 'text', 'seq', false
    },

    /**
     * Initiates the tree
     *
     * @param   mixed   target  Target element/ID as tree container (optional)
     * @param   object  options Tree options (optional)
     * @param   object  events  Tree events (optional)
     * @return  void
     */
    initialize: function(target, options, events) {
        this.setOptions(options);
        this.baseClass = this.options.baseClass;
        this.interactive = this.options.interactive;
        this.checkboxes = this.options.checkboxes;
        this.selected = null;
        this.checked = [];
        this.events = events || {};
        //this.dataById = {};
        this.nodeById = {};
        this.nodeOptions = {
            checkboxes: this.checkboxes,
            interactive: this.interactive
        };
        this.nodeEvents = {
            click: this.onNodeClick.bind(this),
            over: this.onNodeOver.bind(this),
            out: this.onNodeOut.bind(this),
            toggle: this.toggleNode.bind(this)
        };
        if (this.checkboxes) {
            this.nodeEvents.check = this.onNodeCheck.bind(this);
        }

        var sortBy = this.options.sortBy;
        if (sortBy) {
            this.sortFunc = (sortBy === 'text')?
                function(n1, n2) {return n1.text > n2.text;} :
                function(n1, n2) {return n1[sortBy] - n2[sortBy];};
        }

        this.element = this.construct();
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
     * @param   data    Array   Array of nodes that each node is an array itself
                                Possible values for node:
                                [id, pid, text, checked, seq, data] or
                                {id, pid, text, checked, seq, data}
     * @return  void
     */
    loadData: function(data) {
        function buildTree(parent, tree) {
            var store = data.partition(function(row) {
                return row[1] == parent;
            });
            data = store[1];
            store[0].each(function(row) {
                var node = isObject? 
                        new MooPack.Tree.Node(row.id, row.pid, row.text, row.checked, row.seq, row.data) :
                        new MooPack.Tree.Node(row[0], row[1], row[2], row[3], row[4], row[5]);
                tree.addNode(node);
                nodeById[row[0]] = node;
                if (node.chked) {
                    checked.push(node.id);
                }
                if (data.length > 0) {
                    buildTree(row[0], node);
                }
            });
        }
        var root = new MooPack.Tree.Node(0, -1, 'root'),
            isObject = Type.isObject(data[0]),
            nodeById = {},
            checked = [],
            treeXHTML;

        // data.each( function(row, i) {
            // this.dataById[row[0]] = row;
        // }, this);
        // this.rawData = data;

        buildTree(0, root);
        //this.dataObj = root;
        this.nodeById = nodeById;
        this.root = root;

        if (this.checkboxes) {
            this.checked = checked;
        }

        if (this.options.rootNode) {
            treeXHTML = this.treeFrom([root]);
        } else {
            treeXHTML = this.treeFrom(root.nodes);
        }
        if (!this.interactive) {
            this.expandAll(root);
        }
        this.element.update(treeXHTML);
    },

    treeFrom: function(nodes) {
        var ul = new Element('ul');
        if (this.options.sortBy) {
            nodes.sort(this.sortFunc);
        }
        nodes.each( function(node, i) {
            var nodeEl = node.toElement(this.nodeOptions, this.nodeEvents);
            node.container.addClass(this.baseClass + '-node');
            if (this.interactive && node.nodes.length !== 0) {
                nodeEl.getElement('span').addClass('plus');
            }
            ul.grab(nodeEl);
            this.nodeById[node.id] = node;
        }, this);

        return ul;
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
     * selects/checks node and updates `tree.selected`
     */
    onNodeCheck: function(node) {
        node.chked = node.checkbox.checked;
        if (node.chked) {
            this.checked.push(node.id);
        } else {
            this.checked.erase(node.id);
        }
    },

    /**
     * Empties `tree.selected` and clears selected/checked nodes
     */
    clearSelection: function() {
        if (this.selected) {
            this.selected.container.removeClass('selected');
        }
        this.selected = null;
    },

    /**
     * Highlights/checks node
     */
    selectNode: function(node) {
        node.container.addClass('selected');
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

    /**
     * Sets all nodes checked/unchecked
     */
    checkAll: function(checked) {
        Object.each(this.nodeById, function(node) {
            node.chked = checked;
            if (node.checkbox) {
                node.checkbox.checked = checked;
            }
        });
    },

    /**
     * Sets given nodes checked
     */
    check: function(ids) {
        this.checkAll(false);
        ids.each(function(id) {
            var node = this.nodeById[id];
            node.chked = true;
            if (node.checkbox) {
                node.checkbox.checked = true;
            }
        }, this);
    },

    /**
     * Updates `tree.selected` and selects/checks appropriate node(s)
     */
    select: function(sel) {
        this.clearSelection();
        this.selected = sel;
        this.selectNode(sel);
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
                checked = row[3]? row[3].checked : false;
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
        var count = 0;
        this.data.each( function(node) {
            if (node[1] == id) {
                count++;
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
