module.exports = tokenizer = (name) => {
    name = name.replace(/del|de|la|las|mc|y/gi, '');
    return name.split(" ");
}