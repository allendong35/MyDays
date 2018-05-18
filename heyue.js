'use strict';

var dayItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.author = obj.author;
        this.value = obj.value;

    } else {
        this.author = "";
        this.value = [];
    }
};

dayItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var MyDays = function() {
    LocalContractStorage.defineMapProperty(this, "local", {
        parse: function(text) {
            return new dayItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
};

MyDays.prototype = {
    init: function() {
        //TODO:
    },
    save: function(value) {
        // key = key.trim();
        // // value = value.trim();

        // if (key === "" || value === "") {
        //     throw new Error("empty key / value");
        // }
        // if (value.length > 64 || key.length > 64) {
        //     throw new Error("key / value exceed limit length")
        // }

        var from = Blockchain.transaction.from;

        var dictItem = this.local.get(from);
        if (!dictItem) {
            dictItem = new dayItem();
        }
        dictItem.author = from;
        dictItem.value.push(value);
        return this.local.set(from, dictItem);
    },

    del: function(date) {
        // key = key.trim();
        var from = Blockchain.transaction.from;
        // if (key === "") {
        //     throw new Error("empty key")
        // }

        var resp = this.local.get(from);
        // var dictItem = resp;
        for (let index = 0; index < resp.value.length; index++) {
            const element = resp.value[index];
            if (element["date"] === date) {
                resp.value.splice(index,1);
                this.local.set(from, resp);
                return true;
            }
        }
        return date;
    },

    getIn: function(key) {
        var from = Blockchain.transaction.from;
        return this.local.get(from);
    },
    get: function(key) {
        return this.local.get(key);
    }

};

module.exports = MyDays;