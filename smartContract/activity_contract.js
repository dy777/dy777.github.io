"use strict";

var ActivityItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.address = obj.address;
		this.dateTime = obj.dateTime;
	} else {
	    this.name = "";
	    this.address = "";
	    this.dateTime = "";
	}
};

ActivityItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SuperActivity = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new ActivityItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
};

SuperActivity.prototype = {
    init: function () {
        this.size = 0;
    },

    save: function (name, address, dateTime) {

        name = name.trim();
        address = address.trim();
        dateTime = dateTime.trim();
        if (name === "" || address === "" || dateTime === ""){
            throw new Error("empty key / value");
        }
        if (address.length > 64 || dateTime.length > 64 || name.length > 64){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var activityItem = this.repo.get(name);
        if (activityItem){
            throw new Error("活动已存在");
        }

        activityItem = new ActivityItem();
        activityItem.name = name;
        activityItem.address = address;
        activityItem.dateTime = dateTime;

        this.repo.put(name, activityItem);

        var index = this.size;
        this.arrayMap.set(index, name);
        this.size +=1;
    },

    get: function (name) {
        name = name.trim();
        if ( name === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(name);
    },
    forEach: function(limit, offset){

        if(this.size === 0){
            return null;
        }
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
        var result  = [];
        for(var i=offset;i<number;i++){

            var name = this.arrayMap.get(i);
            var activityItem = this.repo.get(name);
            var temp={
                index:i,
                /*name:activityItem.name,
                address:activityItem.address,
                dateTime:activityItem.dateTime*/
                value:activityItem
            }
            result.push(temp);
        }
        return JSON.stringify(result);
    }
};
module.exports = SuperActivity;