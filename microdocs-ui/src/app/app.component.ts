import {Component, Injectable} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {Subject} from "rxjs/Subject";
import {Notification} from "rxjs/Notification";
import {ProjectTree} from "@maxxton/microdocs-core/domain";
import { ProjectService } from "./services/project.service";


/**
 * @application
 * @projectInclude microdocs-core
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})
@Injectable()
export class AppComponent {
  private showFullSideBar:boolean = true;
  private user = {};
  private login = {
    error: <boolean> false,
    status: <number|string> null
  };

  projects:Subject<Notification<ProjectTree>>;
  envs:string[];
  selectedEnv:string;

  constructor(private projectService:ProjectService, private router:Router, private activatedRoute: ActivatedRoute) {
    this.projects = this.projectService.getProjects();

    projectService.getEnvs().subscribe((envs) => {
      this.envs = Object.keys(envs);
      if (projectService.getSelectedEnv() == undefined) {
        for (let key in envs) {
          if (envs[key].default) {
            projectService.setSelectedEnv(key);
            this.selectedEnv = key;
            break;
          }
        }
      }
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['env'] && this.projectService.getSelectedEnv() !== params['env']) {
        this.selectedEnv = params['env'];
        this.projectService.setSelectedEnv(params['env']);
      }
    });
  }

  public onEnvVersion(newEnv:string) {
    this.projectService.setSelectedEnv(newEnv);
    this.selectedEnv = newEnv;

    this.router.navigate(['/dashboard'], {queryParams: {env: newEnv}});
  }


}
