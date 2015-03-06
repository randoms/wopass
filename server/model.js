function Record(db, name){
    this.name = name;
    this.pass = [];
    this.db = db;
    
    this.toJSON = function(){
        return {
            'name': this.name,
            'pass': this.pass,
        }
    }

    this.addRecord = function(content){
        this.pass.push({
            'createTime': Date.now(),
            'content': content,
        })
    }

    this.save = function(){
        db.update({name: this.name}, this.toJSON(), {upsert: true}, function(err, res){
            if(err)console.log(err);
            console.log(res);
        });
    }

    Record.find = function(db, name, cb){
        db.find({name: name}).toArray(function(err, res){
            if(err)console.log(err);
            if(res.length != 1)
                return cb();
            var mrec = new Record(db, name);
            mrec.pass = res[0].pass;
            cb(mrec);
        });
        
    }
}

module.exports = Record;