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

	Implements: [Options, Events],

    options: {
        baseClass   : 'moopack-tree',
        interactive : true,
        checkboxes  : false,
        nodeSelect  : true,
        rootNode    : false,
        orphanNodes : true,
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
                return row.pid == parent;
            });
            data = store[1];
            store[0].each(function(row) {
                var node = new MooPack.Tree.Node(row);
                tree.addNode(node);
                nodeById[row.id] = node;
                if (node.checked) {
                    checked.push(node.id);
                }
                if (data.length) {
                    buildTree(row.id, node);
                }
            });
        }
        var root = new MooPack.Tree.Node({id:0, pid:-1, text:'root', isOpen:true}),
            nodeById = {0: root},
            checked = [];

        buildTree(0, root);
        this.root = root;
        this.nodeById = nodeById;

        // Orphan nodes
        if (this.options.orphanNodes) {
            data.each(function(row) {
                var node = new MooPack.Tree.Node(row);
                node.orphan = true;
                root.nodes.push(node);
                nodeById[row.id] = node;
                if (node.checked) {
                    checked.push(node.id);
                }
            });
        }

        if (this.checkboxes) {
            this.checked = checked;
        }

        this.getNodeElement(root);
        this.getChildElement(root);
        if (this.options.rootNode) {
            this.element.update(new Element('ul').grab(this.root.element));
        } else {
            this.element.update(this.root.ul);
        }
        if (!this.interactive) {
            this.expandAll(root);
        }
    },

    getNodeElement: function(node) {
        if (!node.element) {
            node.element = node.toElement(this.nodeOptions);
            node.container.addClass(this.baseClass + '-node');
            this.updateNodeStatus(node);

            // Events
            node.label.addEvent('click', this.onNodeClick.bind(this, node));
            node.container.addEvent('mouseover', this.onNodeOver.bind(this, node));
            node.container.addEvent('mouseout', this.onNodeOut.bind(this, node));
            if (this.checkboxes) {
                node.checkbox.addEvent('click', this.onNodeCheck.bind(this, node));
            }
            if (this.interactive) {
                node.expander.addEvent('click', this.toggleNode.bind(this, node));
            }
        }
        return node.element;
    },

    getChildElement: function(node, visible) {
        if (!node.ul) {
            var ul = new Element('ul');
            if (this.options.sortBy) {
                node.nodes.sort(this.sortFunc);
            }
            node.nodes.each(function(node) {
                ul.grab(this.getNodeElement(node));
                this.nodeById[node.id] = node;
            }, this);

            node.ul = ul;
            if (visible === false) {
                ul.hide();
            }
            this.getNodeElement(node).grab(ul);
        }
        return node.ul;
    },

//=================================================================================================
// Events
//=================================================================================================
    /**
     * Selects node and updates `tree.selected`
     */
    onNodeClick: function(node) {
        this.select(node);
        this.fireEvent('onNodeClick', node);
    },

    /**
     * Adds `hover` class to the node
     */
    onNodeOver: function(node) {
        node.container.addClass('hover');
    },

    /**
     * Removes `hover` class from the node
     */
    onNodeOut: function(node) {
        node.container.removeClass('hover');
    },

    /**
     * Set node as checked and updates `tree.checked`
     */
    onNodeCheck: function(node) {
        node.checked = node.checkbox.checked;
        if (node.checked) {
            this.checked.push(node.id);
        } else {
            this.checked.erase(node.id);
        }
    },

//=================================================================================================
// API
//=================================================================================================
    getNode: function(id) {
        return this.nodeById[id];
    },

    openNode: function(node, recursive) {
        if (!node.nodes.length) {
            return;
        }

        this.getNodeElement(node);
        this.getChildElement(node).show();
        node.isOpen = true;
        this.updateNodeStatus(node);

        if (recursive) {
            node.nodes.each(function(childNode) {
                this.openNode(childNode, true);
            }, this);
        }
    },

    closeNode: function(node, recursive) {
        if (!node.nodes.length || !node.element) {
            return;
        }
        if (!node.ul) {
            return;
        }
        node.ul.hide();
        node.isOpen = false;
        this.updateNodeStatus(node);

        if (recursive) {
            node.nodes.each(function(childNode) {
                this.closeNode(childNode, true);
            }, this);
        }
    },

    toggleNode: function(node) {
        if (node.isOpen) {
            this.closeNode(node);
        } else {
            this.openNode(node);
        }
    },

    expandAll: function(node) {
        if (!node) {
            node = this.root;
        }
        this.openNode(node, true);
        node.nodes.each(function(nd) {
            this.openNode(nd, true);
        }, this);
    },

    collapseAll: function(node) {
        if (!node) {
            node = this.root;
        } else {
            this.closeNode(node, true);
        }
        node.nodes.each(function(nd) {
            this.closeNode(nd, true);
        }, this);
    },

    openupNode: function(node) {
        var parent = this.nodeById[node.pid];
        if (parent) {
            this.openNode(parent);
            this.openupNode(parent);
        }
    },

    /**
     * Updates `tree.selected` and selects/checks appropriate node(s)
     */
    select: function(node) {
        if (this.selected) {
            this.selected.container.removeClass('selected');
        }
        if (!node) {
            this.selected = null;
        } else {
            this.selected = node;
            this.openupNode(node);
            if (this.options.nodeSelect) {
                node.container.addClass('selected');
            }
        }
    },

    /**
     * Sets given nodes checked
     */
    setChecked: function(ids) {
        this.checkAll(false);
        ids.each(function(id) {
            var node = this.nodeById[id];
            node.checked = true;
            if (node.checkbox) {
                node.checkbox.checked = true;
            }
            this.checked.push(id);
        }, this);
    },

    /**
     * Sets all nodes checked/unchecked
     */
    checkAll: function(checked) {
        this.checked = checked? Object.keys(this.nodeById) : [];
        Object.each(this.nodeById, function(node) {
            node.checked = checked;
            if (node.checkbox) {
                node.checkbox.checked = checked;
            }
        });
    },

    updateNodeStatus: function(node) {
        if (this.interactive) {
            if (!node.nodes.length) {
                node.expander.className = 'spacer';
            } else {
                node.expander.className = node.isOpen? 'minus' : 'plus';
            }
        }
        if (node.orphan) {
            node.container.addClass('orphan');
        } else {
            node.container.removeClass('orphan');
        }
    },

    insertNode: function(data, locate) {
        var parent = this.nodeById[data.pid],
            node = new MooPack.Tree.Node(data);
        this.getNodeElement(node)
        if (!parent) {
            parent = this.root;
        }
        parent.nodes.push(node);
        this.getNodeElement(parent);
        if (locate) {
            this.openNode(parent);
            this.openupNode(parent);
        } else {
            locate = false;
            this.updateNodeStatus(parent);
        }
        if (!parent.ul) {
            this.getChildElement(parent, locate);
        } else {
            parent.ul.grab(this.getNodeElement(node));
        }
        this.nodeById[node.id] = node;
    },

    deleteNode: function(node) {
        var deletedNodes = [];
        if (!node.orphan) {
            var nodes = this.nodeById[node.pid].nodes;
            deletedNodes = node.getNodes();
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].id === node.id) {
                    nodes.splice(i, 1);
                    break;
                }
            }
        }
        deletedNodes.push(node);
        this.nodeById[node.id].element.dispose();
        delete this.nodeById[node.id];
        return deletedNodes;
    },

    updateNode: function(node, data, locate) {
        if (node.id !== data.id) {
            throw 'Tree Error: Update with new ID still is not supported.';
            return;
        }
        if (node.pid !== data.pid) {
            var parent = this.getNode(node.pid),
                newParent = this.getNode(data.pid);
            if (parent) {
                var nodes = parent.nodes;
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].id === node.id) {
                        nodes.splice(i, 1);
                        break;
                    }
                }
                this.getNodeElement(newParent);
                this.updateNodeStatus(parent);
            }
            if (newParent) {
                newParent.nodes.push(node);
                node.orphan = false;
                this.updateNodeStatus(node);
                if (locate) {
                    this.openNode(newParent);
                    this.openupNode(newParent);
                } else {
                    newParent.isOpen = locate = false;
                    this.updateNodeStatus(newParent);
                }
                if (!newParent.ul) {
                    this.getChildElement(newParent, locate);
                } else {
                    newParent.ul.grab(this.getNodeElement(node));
                }
                //this.updateNodeStatus(newParent);
            }
        }
    },

    getChildren: function(node, grandchild) {
        return node.getNodes(grandchild);
    },

    setId: function(id) {
        this.element.id = id;
    },

    setRoot: function(data) {
    }

});
