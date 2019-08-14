module.exports = (req, res) => {
    res.send(`Echo: ${req.query.echo}!`);
}