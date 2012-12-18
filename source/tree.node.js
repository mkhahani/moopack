/**
 * MooPack Tree Node base class
 */
MooPack.Tree.Node = new Class({

    /**
     * Initiates the tree node
     *
     * @param   string  id      Node ID
     * @param   string  pid     Parent node ID
     * @param   string  text    Node text
     * @param   mixed   chked   Checked status ([0,1] or [true, false]) / (optional)
     * @param   int     seq     Sequence number
     * @param   mixed   data    User defined data (optional)
     *
     * @return  object  Class instance of Tree.Node
     */
    initialize: function(id, pid, text, chked, seq, data) {
        this.id    = id;
        this.pid   = pid;
        this.text  = text;
        this.chked = chked || false;
        this.seq   = seq;
        this.data  = data || null;
        this.nodes = [];
    },

    addNode: function(node) {
        var parent = this.getNode(node.pid, false);
        parent.nodes.push(node);
    },

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
     * @param   object   events  {click, over, out, toggle}
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
            checkbox.set('checked', Boolean(this.chked));
            div.grab(checkbox);
        }
        div.update(textEl.update(this.text));

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
