/**
 * MooPack Tree Node base class
 */
MooPack.Tree.Node = new Class({

    /**
     * Initiates tree node
     *
     * @param   object  node    Node data:
     *          mixed   id      Node ID (int/string)
     *          mixed   pid     Parent node ID (int/string)
     *          string  text    Node text
     *          bool    checked Checked status
     *          int     seq     Sequence number
     *          mixed   data    User defined data
     *          bool    isOpen  Node status (expanded or collapsed)
     *
     * @return  object  Class instance of Tree.Node
     */
    initialize: function(node) {
        this.id      = node.id;
        this.pid     = node.pid;
        this.text    = node.text;
        this.checked = node.checked || false;
        this.seq     = node.seq;
        this.data    = node.data || null;
        this.isOpen  = node.isOpen || false;
        this.nodes   = [];
    },

    /**
     * Adds the node to the appropriate location(parent)
     *
     * @param   object  node    Object of Tree.Node
     * @return  bool    True if the parent be found, otherwise false
     */
    addNode: function(node) {
        var parent = this.getNode(node.pid);
        if (parent) {
            parent.nodes.push(node);
            return true;
        } else {
            return false;
        }
    },

    /**
     * Searches for the node with given ID
     *
     * @param   int     id      Node ID
     * @return  mixed   Node object or false if not found
     */
    getNode: function(id) {
        var res = false;
        if (this.id == id) {
            res = this;
        } else {
            try {
                this.nodes.each(function(node) {
                    if (node.id == id) {
                        res = node;
                        throw {};
                    }
                });
            } catch(e) {}
        }

        if (res === false) {
            try {
                this.nodes.each(function(node) {
                    res = node.getNode(id);
                    if (res) {
                        throw {};
                    }
                });
            } catch(e) {}
        }

        return res;
    },

    /**
     * Gets list of child nodes
     *
     * @param   bool    all  Whether include nodes of nodes or not
     * @return  array   List of node objects
     */
    getNodes: function(all) {
        var nodes = this.nodes.clone();
        if (all) {
            this.nodes.each(function(node) {
                nodes = nodes.concat(node.getNodes(true));
            });
        }
        return nodes;
    },

    /**
     * Builds node element
     *
     * @param   object   options {interactive:bool, checkboxes:bool}
     * @return  element  Node element
     */
    toElement: function(options) {
        if (this.element) {
            return this.element;
        }

        var li = new Element('li'),
            div = new Element('div'),
            label = new Element('a');
        if (options.checkboxes) {
            var checkbox = new Element('input', {type: 'checkbox', value: this.id});
            checkbox.set('checked', Boolean(this.checked));
            div.grab(checkbox);
            this.checkbox = checkbox;
        }
        div.grab(label.update(this.text));

        if (options.interactive) {
            var expander = new Element('span', {'class':'spacer'});
            li.grab(expander);
            this.expander = expander;
        }
        li.grab(div);
        this.label = label;
        this.element = li;
        this.container = div;

        return li;
    },

    setId: function(id) {
        this.container.id = id;
    },

    update: function(data) {
        // updates id, text, value
    }

});
