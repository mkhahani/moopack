/**
 * MooPack Tree Node base class
 */
MooPack.Tree.Node = new Class({

    /**
     * Initiates tree node
     *
     * @param   object  node    Node data:
     *          string  id      Node ID
     *          string  pid     Parent node ID
     *          string  text    Node text
     *          mixed   checked Checked status ([true, false] / optional)
     *          int     seq     Sequence number (optional)
     *          mixed   data    User defined data (optional)
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
            this.nodes.each(function(node) {
                if (node.id == id) {
                    res = node;
                    throw $break;
                }
            });
        }

        if (res === false) {
            this.nodes.each(function(node) {
                res = node.getNode(id);
                if (res) {
                    throw $break;
                }
            });
        }

        return res;
    },

    /**
     * Gets list of child nodes of `this` node
     *
     * @param   bool    recursive   Whether check through child nodes
     * @return  array   List of node objects
     */
    getNodes: function(recursive) {
        var nodes = this.nodes.clone();
        if (recursive) {
            this.nodes.each(function(node) {
                var res = node.getNodes(true);
                nodes = nodes.concat(res);
            });
        }
        return nodes;
    },

    /**
     * Builds node element
     *
     * @param   object   options {interactive:bool, checkboxes:bool}
     * @param   object   events  {click, over, out, toggle, check}
     * @return  element  Node element
     */
    toElement: function(options, events) {
        if (this.element) {
            return this.element;
        }

        var li = new Element('li'),
            div = new Element('div'),
            textEl = new Element('a');
        if (options.checkboxes) {
            var checkbox = new Element('input', {type: 'checkbox', value: this.id});
            checkbox.set('checked', Boolean(this.checked));
            checkbox.addEvent('click', events.check.pass(this));
            div.grab(checkbox);
            this.checkbox = checkbox;
        }
        div.grab(textEl.update(this.text));

        // events
        textEl.addEvent('click', events.click.pass(this));
        div.addEvent('mouseover', events.over.pass(this));
        div.addEvent('mouseout', events.out.pass(this));

        if (options.interactive) {
            var expander = new Element('span', {'class':'spacer'});
            expander.addEvent('click', events.toggle.pass(this));
            li.grab(expander);
            this.expander = expander;
        }
        li.grab(div);
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
