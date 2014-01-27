/**
 * MooPack Tree Events
 */
MooPack.Tree.implement({
    /**
     * Node click event
     */
    nodeClick: function(node) {
        this.select(node);
        this.fireEvent('nodeClick', node);
    },

    /**
     * Node mouseover event
     */
    nodeOver: function(node) {
        node.container.addClass('hover');
        this.fireEvent('nodeOver', node);
    },

    /**
     * Node mouseout event
     */
    nodeOut: function(node) {
        node.container.removeClass('hover');
        this.fireEvent('nodeOut', node);
    },

    /**
     * Checkbox change event
     */
    nodeCheck: function(node) {
        node.checked = node.checkbox.checked;
        if (node.checked) {
            this.checked.push(node.id);
        } else {
            this.checked.erase(node.id);
        }
        this.fireEvent('nodeCheck', node);
    },

    /**
     * Node open/close event
     */
    toggleNode: function(node) {
        if (node.isOpen) {
            this.closeNode(node);
        } else {
            this.openNode(node);
        }
    }

});