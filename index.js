/**
 * @param model {mongoose.model}
 * @param page {Number}
 * @param path {String}
 * @param query {Object}
 * @param factor {Number}
 * @param sort {String}
 * @param fields {Object}
 */
function Pidgeot({model, path='/', page=1, query={}, factor=50, sort=null, fields={}}) {
    if(!model) {
        throw new Error('A mongoose model must be passed.');
    }
    if(!(this instanceof Pidgeot)) {
        return new Pidgeot({model, path, page, query, factor, sort, fields});
    }
    this.model = model;
    this.path = path;
    this.page = page;
    this.query = query;
    this.factor = factor;
    this.sort = sort;
    this.fields = fields;
}

Pidgeot.prototype.paginate = function() {
    const paginatePromise = new Promise((resolve, reject) => {
        this.model.find(this.query).count((err, num_records) => {
            if(err) {
                return reject(err);
            }
            const num_pages = Math.ceil(num_records / this.factor);

            // normalize page number
            let page = this.page;
            page = (isNaN(page) || page < 1) ? 1 : page;
            page = (page > num_pages) ? num_pages : page;
            this.page = page;

            const skip_rate = (page <= 0) ? 0 : ((page - 1) * this.factor);
            const prev = (page === 1) ? 1 : (page - 1);
            const next = (page === num_pages) ? num_pages : (page + 1);

            let queryParams = ``;
            for(let field in this.fields) {
                queryParams += `&${field}=${this.fields[field] || ''}`;
            }

            const prev_page = `${this.path}?page=${prev}${queryParams}`;
            const next_page = `${this.path}?page=${next}${queryParams}`;

            const dbQuery = this.model.find(this.query);
            if(this.sort) {
                dbQuery.sort(this.sort);
            }
            if(skip_rate > 0) {
                dbQuery.skip(skip_rate);
            }
            dbQuery
                .limit(this.factor)
                .lean()
                .exec((err, records) => {
                    if(err) {
                        return reject(err);
                    }
                    resolve({
                        page,
                        records,
                        prev_page,
                        next_page,
                        num_records,
                        num_pages
                    });
                });
        });
    });
    return paginatePromise;
}

/**
 * Exports
 */
module.exports = Pidgeot;