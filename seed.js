let data = require("./collected_data.json");
let data_candidate = require("./dummy_data_candidate.json");

const mongoose = require("mongoose"),
	Candidate = require("./models/candidate"),
	Job = require("./models/job_offer"),
	{ getMaxScore } = require("./controllers/userController");

mongoose.connect("mongodb://localhost:27017/rem_matching_test", {
	useNewUrlParser: true,
});

mongoose.connection;

const soft_skills = [
	{ name: "Emotional Intelligence", importance: 3 },
	{ name: "Leadership", importance: 3 },
	{ name: "Analytical Skills", importance: 3 },
	{ name: "Learning Desire", importance: 3 },
	{ name: "Big Picture Thinking", importance: 3 },
	{ name: "Communication and Interpersonal Skills", importance: 3 },
	{ name: "Positive Attitude", importance: 3 },
	{ name: "Strong Work Ethic", importance: 3 },
	{ name: "Problem-Solving Skills", importance: 3 },
	{ name: "Teamwork", importance: 3 },
	{ name: "Perform Under Pressure", importance: 3 },
	{ name: "Creativity", importance: 3 }
];

let randomSoftskills = (size) => {
	let a = soft_skills;
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a.slice(0, size - 1);
}

let insertJobs = async (array) => {
	const jobLoop = array.map(async (c) => {
		let techstack = [];
		for (let i = 0; i < c.hard_skills.length; i++) {
			techstack.push({
				name: c.hard_skills[i],
				importance: 3,
			});
		}
		let jobParams = {
			hard_skills: techstack,
			job_title: c.job_title,
			location: c.location,
			company_name: c.company_name,
			description: c.description,
			soft_skills: randomSoftskills(Math.floor(Math.random() * 4) + 1),
			work_culture_keywords: c.work_culture_keywords,
		};
		jobParams.max_score = await getMaxScore("recruiter", jobParams);
		await new Job(jobParams).save();
	});
	await Promise.all(jobLoop);
	console.log("++ The amount of jobs seeded: " + jobLoop.length);
}

let insertCandidates = async (array) => {
	const candidateLoop = array.map(async (c) => {
		let techstack = [];
		let work_culture = [];
		for (let i = 0; i < c.hard_skills.length; i++) {
			techstack.push({
				name: c.hard_skills[i],
				importance: 3,
			});
		}
		c.work_culture_preferences.forEach((c) => {
			work_culture.push({
				name: c,
				importance: 3,
			});
		});

		// because dummy data has soft skills as strings
		let softskills = (Array.isArray(c.soft_skills)) ? c.soft_skills : c.soft_skills.split(",");

		let candidateParams = {
			preferred_position: c.preferred_position,
			job_type: c.job_type,
			expected_salary: c.expected_salary,
			current_location: c.current_location,
			preferred_location: c.preferred_location,
			description: c.description,
			hard_skills: techstack,
			soft_skills: softskills,
			work_culture_preferences: work_culture,
		}
		candidateParams.max_score = await getMaxScore("candidate", candidateParams);
		await new Candidate(candidateParams).save();
	});
	await Promise.all(candidateLoop);
	console.log("++ The amount of candidates seeded: " + candidateLoop.length);
}

insertJobs(data);
insertCandidates(data_candidate).then(() => mongoose.connection.close());