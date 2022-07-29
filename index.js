const { program } = require('commander')

const { gitCherry } = require('./git-related/cherry')

program
  // .option('-r, --remote')
  .option('-c, --cherry')

  .action((options) => {
    console.log('>>options:', options)
    const { cherry } = options
    // if (remote) listRemote()
    if (cherry) gitCherry()
  })

program.parse(process.argv)