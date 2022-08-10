const { program } = require('commander')

const { gitCherry } = require('./git-related/cherry')

program
  .option('-cherry, --cherry')

  .action((options) => {
    const { cherry } = options

    if (cherry) gitCherry()
  })

program.parse(process.argv)