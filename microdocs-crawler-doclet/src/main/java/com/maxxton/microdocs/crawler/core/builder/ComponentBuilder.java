package com.maxxton.microdocs.crawler.core.builder;

import com.maxxton.microdocs.crawler.core.domain.component.Annotation;
import com.maxxton.microdocs.crawler.core.domain.component.Component;
import com.maxxton.microdocs.crawler.core.domain.component.ComponentType;
import com.maxxton.microdocs.crawler.core.domain.component.Method;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Steven Hermans
 */
public class ComponentBuilder implements Builder<Component> {

    private Component component = new Component();
    private String simpleName;

    public String simpleName() {
        return simpleName;
    }

    public ComponentBuilder simpleName(String name) {
        this.simpleName = name;
        return this;
    }

    public ComponentBuilder name(String name){
        component.setName(name);
        return this;
    }

    public ComponentBuilder type(ComponentType type){
        component.setType(type);
        return this;
    }

    public ComponentBuilder description(String description){
        component.setDescription(description);
        return this;
    }

    public ComponentBuilder authors(String... authors){
        List<String> authorList = new ArrayList();
        for(String author : authors){
            authorList.add(author);
        }
        return authors(authorList);
    }

    public ComponentBuilder authors(List<String> authors) {
        component.setAuthors(authors);
        return this;
    }

    public ComponentBuilder annotation(AnnotationBuilder annotationBuilder){
        return annotation(annotationBuilder.build());
    }

    public ComponentBuilder annotation(Annotation annotation){
        component.getAnnotations().put(annotation.getName(), annotation);
        return this;
    }

    public ComponentBuilder method(MethodBuilder methodBuilder){
        method(methodBuilder.build());
        return this;
    }

    public ComponentBuilder method(Method method){
        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.append(method.getName() + "(");
        for(String param : method.getParameters()){
            stringBuilder.append(param + ",");
        }
        stringBuilder.deleteCharAt(stringBuilder.length()-1);
        stringBuilder.append(")");
        component.getMethods().put(stringBuilder.toString(), method);
        return this;
    }

    public ComponentBuilder dependencies(ComponentBuilder component){
        Component ref = new Component();
        ref.setReference("#/components/" + component.simpleName());
        this.component.getDependencies().add(ref);
        return this;
    }

    @Override
    public Component build() {
        return component;
    }
}
