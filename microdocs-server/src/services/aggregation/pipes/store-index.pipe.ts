import { Pipe } from "../pipe";
import { buildTree } from "../func/tree.func";
/**
 * @author Steven Hermans
 */
export class StoreIndexPipe extends Pipe<Pipe>{

  protected run():Pipe {
    let projectTree = buildTree(this);
    this.projectService.storeAggregatedProjects(this.env, projectTree);
    return this;
  }

}