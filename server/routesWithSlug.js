function routesWithSlug({ server, app }) {
  server.get('/books/:bookSlug/:chapterSlug', (req, res) => {
    const { bookSlug, chapterSlug } = req.params;
    app.render(req, res, '/public/read-chapter', { bookSlug, chapterSlug });
  });

  server.get('/admin/edit-book/:slug', (req, res) => {
    const { slug } = req.params;
    app.render(req, res, '/admin/edit-book', { slug });
  });

  server.get('/admin/book-detail/:slug', (req, res) => {
    const { slug } = req.params;
    app.render(req, res, '/admin/book-detail', { slug });
  });

  server.get('/faq/:slug', (req, res) => {
    const { slug } = req.params;
    app.render(req, res, '/faq', { slug });
  });

  server.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    app.render(req, res, '/reset-password', { token });
  });

  server.get('/restaurant/edit-owner/:id', (req, res) => {
    const { id } = req.params;
    app.render(req, res, '/restaurant/edit-owner', { id });
  });

  server.get('/restaurant/edit/:id', (req, res) => {
    const { id } = req.params;
    app.render(req, res, '/restaurant/edit', { id });
  });

  server.get('/venue/edit/:id', (req, res) => {
    const { id } = req.params;
    app.render(req, res, '/venue/edit', { id });
  });

  server.get('/accomodation/edit/:id', (req, res) => {
    const { id } = req.params;
    app.render(req, res, '/accomodation/edit', { id });
  });

  server.get('/restaurant/view/:id', (req, res) => {
    const { id } = req.params;
    app.render(req, res, '/restaurant/view', { id });
  });

  server.get('/admin/edit/:id', (req, res) => {
    const { id } = req.params;
    app.render(req, res, '/admin/edit', { id });
  });

  server.get('/detail/:slug', (req, res) => {
    const { slug } = req.params;
    app.render(req, res, '/detail', { slug });
  });

  server.get('/books/:slug', (req, res) => {
    res.redirect(`/books/${req.params.slug}/introduction`);
  });

  server.get('/menu/categories/:id', (req, res) => {
    const { id } = req.params;
    app.render(req, res, '/menu/categories', { id });
  });

  server.get('/menu/sub-categories/:id', (req, res) => {
    const { id } = req.params;
    app.render(req, res, '/menu/sub-categories', { id });
  });

  server.get('/menu/items/:id', (req, res) => {
    const { id } = req.params;
    app.render(req, res, '/menu/items', { id });
  });

  server.get('/events/:id', (req, res) => {
    const { id } = req.params;
    app.render(req, res, '/events', { id });
  });

  server.get('/faqs/:id', (req, res) => {
    const { id } = req.params;
    app.render(req, res, '/faqs', { id });
  });

  server.get('/stats/:user_id', (req, res) => {
    const { user_id } = req.params;
    app.render(req, res, '/stats', { user_id });
  });

  server.get('/subscription/confirm/:email', (req, res) => {
    const { email } = req.params;
    app.render(req, res, '/subscription/confirm', { email });
  });
}

module.exports = routesWithSlug;
