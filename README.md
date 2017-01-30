## Promise based express-mongoose configurable server-side paginator

---

```js
/**
 * song_model.js
 **/
 
// create mongoose schema & model
const mongoose = require('mongoose');
const {Schema} = mongoose;

const songSchema = new Schema({
	name: String,
	artist: String,
	duration: Number
});

module.exports = mongoose.model('Song', songSchema);
```

---

```js
/**
 * app.js
 */
 
const app = require('express')();
const Pidgeot = require('pidgeot');
const Song = require('./song_model');

app.get('/', (req, res) => {
    // initialize paginator instance
	const Paginator = Pidgeot({
		model: Song, 
		page: req.query.page, 
		query: {
			duration: {
				$gt: 200,
				$lte: 50
			}
		}, 
		factor: 20, 
		sort: 'name', 
		fields: {
			collection: 'songs'
		}
	});

	// paginage
	Paginator.paginate()
	.then(data => {
		const {page, records, prev_page, next_page, num_records, num_pages} = data;
		console.log(`Page: ${page}`); // page given or 1
		console.log(`Songs: ${JSON.stringify(records)}`); // songs array
		console.log(`Prev: ${prev_page}`); // /?page={prev_page}&collection=songs
		console.log(`Next: ${next_page}`); // /?page={next_page}&collection=songs
		console.log(`Songs Count: ${num_records}`); // number of records returned 
		console.log(`Page Count: ${num_pages}`); // total number of pages
		// render template passing data
		res.render('songs_template.html', {
			page, 
			records, 
			prev_page, 
			next_page, 
			num_records, 
			num_pages
		});
	}).catch(err => {
		console.log(err.message);
		res.render('error_template.html', {message: 'Error.'});
	});
});

app.listen(8000);
```

---

### Class attributes:

```js
{
    model  :  // mongoose model (required),
    path   :  // route path (default '/'),
    page   :  // what page to paginate to (default 1),
    query  :  // db query to filter records by (default {}),
    factor :  // how many records should be shown on a page (default 50),
    sort   :  // tell mongoose how to sort the returned records (default null),
    fields :  // external query params to include (default {})
}
```

---
### For fun, lets render a simple [nunjucks](https://mozilla.github.io/nunjucks/) template:

```js
/**
 * app.js
 */
 
const app = require('express')();
const nunjucks = require('nunjucks');
const Pidgeot = require('pidgeot');
const Song = require('./song_model');

// config nunjucks
nunjucks.configure('views', {
	autoSpace: true,
	express: app,
	watch: true
});

// index route
app.get('/', (req, res) => {

    // initialize paginator instance
	const Paginator = Pidgeot({
		model: Song,
		page: req.query.page,
		query: {
			duration: {
				$gt: 200,
				$lte: 50
			}
		},
		factor: 20,
		sort: 'name',
		fields: {
			collection: 'songs'
		}
	});

	// paginate (promise returned)
	Paginator.paginate()
        .then(data => {
            const {page, records, prev_page, next_page, num_records, num_pages} = data;
            // render template passing data
            res.render('songs_template.html', {
                page,
                records,
                prev_page,
                next_page,
                num_records,
                num_pages
            });
        }).catch(err => {
            console.log(err.message);
            res.render('error_template.html', {message: 'Error.'});
        });

});

app.listen(8000);
```

```html
{% if records.length > 0 %}
<table class="table table-striped">
    <thead>
        <tr>
            <td>#</th>
            <td>Name</td>
            <td>Artist</td>
            <td>Duration</td>
        </tr>
    </thead>
    <tbody>
    {% for record in records %}
        <tr class="records">
            <td>{{ loop.index }}.</td>
            <td>{{ record.name }}</td>
            <td>{{ record.artist }}</td>
            <td>{{ record.duration }}</td>
        </tr>
    {% endfor %}
    </tbody>
</table>
{% endif %}

<!-- pagination -->
{% if num_pages > 1 %}
<nav aria-label="Page navigation">
    <ul class="pager">
        {% if page > 1 %}
        <li class="previous">
            <a href="{{ prev_page }}"><span aria-hidden="true">&larr;</span> Prev</a>
        </li>
        {% endif %}
        {% if page < num_pages %}
        <li class="next">
            <a href="{{ next_page }}">Next <span aria-hidden="true">&rarr;</span></a>
        </li>
        {% endif %}
    </ul>
</nav>
{% endif %}
```
---
###Install on npm:
```bash
npm install pidgeot --save
```
[View on npm](https://www.npmjs.com/package/pidgeot)
---

<img src="https://s-media-cache-ak0.pinimg.com/736x/e6/e7/12/e6e7122608bc277334281d9aac4a8ce1.jpg" alt="Pidgeot" title="Pidgeot" />
