const Discord = require('discord.js')
require('dotenv').config()
const Airtable = require('airtable')
const express = require('express')
const app = express()
const config = require('./config.js')

const bt5red = '#561B25'
const prefix = config.prefix

app.listen(() => console.log('Server started'))

app.use('/', (request, res) => {
	res.send('Online.')
})

const client = new Discord.Client()

const stats = async (channel, message) => {
	let category = ''
	const cmd = message[0]
	const cat = message[1]
	const cor = message.slice(2)
	const info = cor[cor.length - 1]
	if (cat === 'ap') {
		category = 'AP Courses'
	} else if (cat === 'cl') {
		category = 'CL Courses'
	} else if (cat === 'c&tp') {
		category = 'C&TP Courses'
	} else if (cat === 'misc') {
		category = 'Misc. Courses'
	}

	if (category === '') {
		return channel.send('Invalid course category: `' + cat + '`')
	}

	const base = new Airtable({apiKey: process.env.KEY}).base(
		'apprEDMBB2pnH11HZ'
	)
	const courses = []
	base(category)
		.select({
			maxRecords: 100,
			view: 'Grid view'
		})
		.eachPage(
			async function page(records) {
				records.forEach(record => {
					courses.push({
						FormattedName: record.get('Formatted Name'),
						Name: record.get('Name'),
						Code: record.get('Course Code'),
						Credits: record.get('Credits'),
						Prerequisites: record.get('Prerequisite(s)'),
						Corequisites: record.get('Corequisite(s)'),
						Syllabus: record.get('Syllabus'),
						Notes: record.get('Notes'),
						Instructors: record.get('Instructors'),
						ApproximateCompletionTime: record.get(
							'Approximate Completion Time'
						)
					})
				})
				if (cmd === 'courses') {
					let embed = new Discord.RichEmbed()
						.setColor(bt5red)
						.setTitle('Beyond The Five ' + category)
						.setURL('https://beyondthefive.com/courses')
						.setTimestamp()
					let j = 0
					for (let i = 0; i < courses.length; i++) {
						/* Let note = "None";
            if (courses[i].Notes != null) {
              note += courses[i].Notes;
            }

            if (courses[i].Prerequisites != null) {
              note += "\nPrerequisite(s): " + courses[i].Prerequisites;
            }

            if (courses[i].Corerequisites != null) {
              note += "\nCorerequisite(s): " + courses[i].Corerequisites;
            }

            if (courses[i].Instructors != null) {
              note += "\nInstructors: " + courses[i].Instructors;
            }

            if (courses[i].ApproximateCompletionTime != null) {
              note +=
                "\nApproximate Completion Time: " +
                courses[i].ApproximateCompletionTime;
            }

            if (note.length > 4) {
              note = note.slice(4);
            } */

						// embed.addField(courses[i].FormattedName, note);
						embed.addField(courses[i].Name, courses[i].Credits + ' Credits')
						note = ''
						j++
						if (j === 25) {
							await channel.send(embed)
							embed = new Discord.RichEmbed()
								.setColor(bt5red)
								.setTitle('Beyond The Five ' + category)
								.setURL('https://beyondthefive.com/courses')
								.setTimestamp()
							j = 0
						}

						if (i === courses.length - 1) {
							return channel.send(embed)
						}
					}
				}

				if (cmd === 'course') {
					if (
						[
							'credits',
							'prerequisites',
							'corequisites',
							'syllabus',
							'notes',
							'instructors',
							'time'
						].includes(info)
					) {
						for (const element of courses) {
							let parsedCourseName = element.Name.toLowerCase()
							if (parsedCourseName.includes('ap®')) {
								parsedCourseName = parsedCourseName.slice(4)
							}

							let codeCheck = element.Code
							if (codeCheck == null) {
								codeCheck = ''
							}

							if (
								parsedCourseName === cor.slice(0, -1).join(' ') ||
                codeCheck.toLowerCase() === cor.slice(0, -1).join(' ')
							) {
								if (info === 'credits') {
									return channel.send(
										element.Name + ' is ' + element.Credits + ' credits.'
									)
								}

								if (info === 'corequisites') {
									let o = element.Corequisites
									if (o === undefined) {
										o = 'None'
									}

									return channel.send(
										element.Name + ' has the following corequisite(s):\n' + o
									)
								}

								if (info === 'prerequisites') {
									let o = element.Prerequisites
									if (o === undefined) {
										o = 'None'
									}

									return channel.send(
										element.Name + ' has the following prerequisite(s):\n' + o
									)
								}

								if (info === 'time') {
									return channel.send(
										element.Name +
                      '\'s estimated completion time is ' +
                      element.ApproximateCompletionTime
									)
								}

								return channel.send(
									element.Name + ' has no attribute `' + info + '`'
								)
							}
						}
					} else {
						for (const element of courses) {
							let parsedCourseName = element.Name.toLowerCase()
							if (parsedCourseName.includes('ap®')) {
								parsedCourseName = parsedCourseName.slice(4)
							}

							let codeCheck = element.Code
							if (codeCheck == null) {
								codeCheck = ''
							}

							if (
								parsedCourseName === cor.join(' ') ||
                codeCheck.toLowerCase() === cor[0]
							) {
								embed = new Discord.RichEmbed()
									.setColor(bt5red)
									.setTitle(element.Name)
									.setTimestamp()

								if (element.Notes != null) {
									embed.addField('Note', element.Notes)
								}

								if (element.Code != null) {
									embed.addField('Course Code', element.Code)
								}

								if (element.Credits != null) {
									embed.addField('Credits', element.Credits)
								}

								if (element.Prerequisites != null) {
									embed.addField('Prerequisite(s)', element.Prerequisites)
								}

								if (element.Corerequisites != null) {
									embed.addField('Corerequisite(s)', element.Corerequisites)
								}

								if (element.Instructors != null) {
									embed.addField('Instructors', element.Instructors)
								}

								if (element.ApproximateCompletionTime != null) {
									embed.addField(
										'Approximate Completion Time',
										element.ApproximateCompletionTime
									)
								}

								return channel.send(embed)
							}
						}
					}
				}
			},
			async function done(err) {
				await channel.send('ERROR')
				return channel.send(err)
			}
		)
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', async message => {
	if (message.author.bot) {
		return
	}

	const m = message.content.toLowerCase().split(' ')
	const c = message.channel
	const cmd = m[1]
	const args = m.slice(2)

	if (m[0] === prefix) {
		if (cmd === 'courses') {
			if (args[0] === undefined) {
				return c.send('Provide a course category.')
			}

			return stats(c, m.splice(1))
		}

		if (cmd === 'course') {
			if (args[0] === undefined) {
				return c.send('Provide a course category.')
			}

			if (args[1] === undefined) {
				return c.send('Provide a course.')
			}

			return stats(c, m.splice(1))
		}

		if (cmd == 'ping') {
			const m = await message.channel.send('Pong 🏓')
			return m.edit(
				`Pong 🏓\nBot latency is ${
					m.createdTimestamp - message.createdTimestamp
				}ms. Discord API Latency is ${Math.round(client.ping)}ms`
			)
		}

		if (cmd === 'help') {
			const embed = new Discord.RichEmbed()
				.setColor(bt5red)
				.setTitle('Beyond The Five Bot Commands')
				.setTimestamp()
				.addField(
					prefix + ' help',
					'Shows you what you are looking at right now.'
				)
				.addField(prefix + ' ping', 'Display\'s bot and Discord API latency.')
				.addField(
					prefix + ' courses [category]',
					'Lists all courses in a category.'
				)
				.addField(
					prefix + ' course [category] [course name]',
					'Lists information about a course.'
				)
				.addField(
					prefix + ' course [category] [course name] [attribute]',
					'Lists a specific course attribute'
				)
				.addField(
					'Course Categories',
					'Possible course categories are: `ap` (AP® Courses), `cl` (College-Level Courses), `c&tp` (College & Test Prep), and `misc` (Misc. Courses)'
				)
				.addField(
					'Course Attributes',
					'Possible course attributes are: `credits` (Credits), `corequisites` (Corequisites), `prerequisites` (Prerequisites, and `time` (Esitmated Completion Time)'
				)

			return c.send(embed)
		}
	}
})

client.login(process.env.token)
