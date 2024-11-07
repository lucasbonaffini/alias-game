const inMemoryAuthenticateToken = require("../../middlewares/in-memory/in-memory-authenticateToken");
const teamService = require("../../services/teamService");

const inMemoryTeamController = {

    async createTeamController(datas) {
        
        if(typeof(datas.teamName) !== "string") {
            throw new Error("The teamName field must be a string !");
    
        }else {
    
            const checkUserById = await teamService.findUserByid(datas.userId);
    
            if(checkUserById) {
                throw new Error("User already have a team !");
            }

            const checkToken = await inMemoryAuthenticateToken(datas.token);

            if(checkToken === true) {

                const team = await teamService.createTeamService({
                    teamName: datas.teamName,
                    userId: datas.userId
                });
            
                return team;
            }
        }
    },
    
    async getSpecificTeamController(datas) {
    
        const findTeamById = await teamService.getSpecificTeam(datas.team_id);
    
        if(!findTeamById) {
            throw new Error("Team Not Found !");
        }

        const checkToken = await inMemoryAuthenticateToken(datas.token);

        if(checkToken === true) {
            return findTeamById;
        }

    },
    
    async getAllTeamsController(token) {

        const checkToken = await inMemoryAuthenticateToken(token);

        if(checkToken === true) {
            const getAllTeams = await teamService.getAllTeams();
            return getAllTeams;
        }

    },
    
    async updateSpecificTeamFieldController(datas) {
    
        if(typeof(datas.teamName) !== "string") {
            throw new Error("The teamName filed must be a string !");
    
        }else {
    
            const findTeamById = await teamService.getSpecificTeam(datas.team_id);
    
            if(!findTeamById) {
                throw new Error("Team Not Found !");
            }

            const checkToken = await inMemoryAuthenticateToken(datas.token);

            if(checkToken === true) {
                const updateTeamNameField = await teamService.updateSpecificTeamField(datas.team_id, datas.teamName);
                return updateTeamNameField;   
            }
        }

    },
    
    async deleteTeamController(datas) {
    
        const findTeamById = await teamService.getSpecificTeam(datas.team_id);
    
        if(!findTeamById) {
            throw new Error("Team Not Found !");
        }

        const checkToken = await inMemoryAuthenticateToken(datas.token);

        if(checkToken === true) {
            await teamService.deleteTeam(datas.team_id);
            return { message: "Team Deleted with sucess !" };   
        }

    }

}

module.exports = inMemoryTeamController;
