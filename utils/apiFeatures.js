class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr
    }

    search(){
        if(!this.queryStr.search) return this;
        const search = this.queryStr.search ? {
            $text: {
                $search: this.queryStr.search
            }
        }: {}

        this.query = this.query.find(search).sort( { score: { $meta: "textScore" } } )
        return this;
    }

    filter(){
        let copyQuery = {...this.queryStr};
        const resolved = ["page", "pageSize", "search"]

        resolved.forEach(element => {
            delete copyQuery[element]
        });
        copyQuery = JSON.stringify(copyQuery);
        copyQuery = copyQuery.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
    
        this.query = this.query.find(JSON.parse(copyQuery));
        return this
    }

    pagination(){
        const page = this.queryStr.page || 1;
        const pageSize = this.queryStr.pageSize || 10;

        this.query = this.query.limit(pageSize).skip((page-1) * pageSize);

        return this;
    }
}
module.exports = ApiFeatures