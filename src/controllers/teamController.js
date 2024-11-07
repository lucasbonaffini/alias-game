const teamService = require("../services/teamService");

const createTeamController = async (req, res) => {

    const user = req.user;
    const { teamName } = req.body;
    
    if(teamName === "") {
        return res.status(401).json({ message: "TeamName field must have a value !" });

    }else if(typeof(teamName) !== "string") {
        return res.status(401).json({ message: "The teamName field must be a string !" });

    }else {

        const checkUserById = await teamService.findUserByid(user.id);

        if(checkUserById) {
            return res.status(401).json({ message: "User already have a team !" });
        }
    
        const team = await teamService.createTeamService({
            teamName,
            userId: user.id
        });
    
        return res.status(201).json(team);
    }
};

const getSpecificTeamController = async (req, res) => {

    const { team_id } = req.query;

    const findTeamById = await teamService.getSpecificTeam(team_id);

    if(!findTeamById) {
        return res.status(404).json({ message: "Team Not Found !" });
    }

    return res.status(200).json(findTeamById);
}

const getAllTeamsController = async (req, res) => {
    const getAllTeams = await teamService.getAllTeams();
    return res.status(200).json(getAllTeams);
}

const updateSpecificTeamFieldController = async (req, res) => {

    const { team_id } = req.query;
    const { teamName } = req.body;

    if(teamName === "") {
        return res.status(401).json({ message: "TeamName field must have a value !" });

    }else if(typeof(teamName) !== "string") {
        return res.status(401).json({ message: "The teamName field must be a string !" });

    }else {

        const findTeamById = await teamService.getSpecificTeam(team_id);

        if(!findTeamById) {
            return res.status(404).json({ message: "Team Not Found !" });
        }

        const updateTeamNameField = await teamService.updateSpecificTeamField(team_id, teamName);

        return res.status(201).json(updateTeamNameField);
    }
}

const deleteTeamController = async (req, res) => {

    const { team_id } = req.query

    const findTeamById = await teamService.getSpecificTeam(team_id);

    if(!findTeamById) {
        return res.status(404).json({ message: "Team Not Found !" });
    }

    await teamService.deleteTeam(team_id);
    return res.status(200).json({ message: "Team Deleted with sucess !" });
};

module.exports = { 
    createTeamController,
    getSpecificTeamController,
    getAllTeamsController,
    updateSpecificTeamFieldController,
    deleteTeamController
};