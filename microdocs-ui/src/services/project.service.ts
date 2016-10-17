import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {Http, Response} from "@angular/http";
import {RestClient} from "angular2-rest/angular2-rest";
import {SnackbarService} from "@maxxton/components/services/snackbar.service";
import {TreeNode, Project, Environments} from "microdocs-core-ts/dist/domain";

const TIMEOUT:number = 1000;

export abstract class ProjectService extends RestClient {
  
  private env:string;
  private lastValue:TreeNode;
  private projects:Subject<TreeNode> = new Subject<TreeNode>();
  private lastRefresh:number = 0;
  
  constructor(http:Http, private snackbarService:SnackbarService) {
    super(http);
    this.projects.subscribe(node => this.lastValue = node);
  }
  
  public getProjects(env:string = this.getSelectedEnv()):Observable<TreeNode> {
    this.refreshProjects(env);
    return this.projects;
  }
  
  public refreshProjects(env:string = this.getSelectedEnv()){
    if(this.lastRefresh + TIMEOUT < new Date().getTime()) {
      this.loadProjects(env).subscribe(node => this.projects.next(node), error => this.snackbarService.addNotification("Failed to load project list"));
      this.lastRefresh = new Date().getTime();
    }else{
      setTimeout(() => this.projects.next(this.lastValue), 20);
    }
  }
  
  public abstract loadProjects(env:string):Observable<TreeNode>;

  public abstract getProject(name:string, version?:string, env?:string):Observable<Project>;

  public abstract importProject(project:Project, name:string, group:string, version:string, env?:string):Observable<Response>;
  
  public abstract deleteProject(name:string, version?:string, env?:string):Observable<Response>;
  
  public setSelectedEnv(env:string) {
    this.env = env;
    this.lastRefresh = 0;
    this.refreshProjects(env);
  }
  
  public getSelectedEnv():string {
    return this.env;
  }
  
  abstract getEnvs():Observable<{[key:string]:Environments}>;
  
}