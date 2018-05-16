'use strict';

var ChatRecordItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.author = obj.author;
        this.value = obj.value;

    } else {
        this.author = "";
        this.key = "";
        this.value = [];
    }
};

ChatRecordItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var WorldCup = function() {
    LocalContractStorage.defineMapProperty(this, "local", {
        parse: function(text) {
            return new ChatRecordItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
};

WorldCup.prototype = {
    init: function() {
        //TODO:
    },
    save: function(key, value) {
        key = key.trim();
        // value = value.trim();

        if (key === "" || value === "") {
            throw new Error("empty key / value");
        }
        if (value.length > 64 || key.length > 64) {
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;

        var dictItem = this.local.get(key);
        if (!dictItem) {
            dictItem = new ChatRecordItem();
        }
        dictItem.author = from;
        dictItem.key = key;
        dictItem.value.push(value);
        return this.local.set(key, dictItem);
    },

    get: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.local.get(key);
    }
};

module.exports = WorldCup;