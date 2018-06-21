import Component from "../../infrastructure/world/Component";



export default class Combatant extends Component {

    team: number;


    enemyFilter = (go) => {
        let combatant = go.components.get(Combatant);
        return combatant != null && combatant.team != this.team;
    };
}