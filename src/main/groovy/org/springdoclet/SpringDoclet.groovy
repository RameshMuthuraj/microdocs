package org.springdoclet

import com.sun.javadoc.Doclet
import com.sun.javadoc.RootDoc

class SpringDoclet extends Doclet {
  private static final String OPTION_DIRECTORY = '-d'
  private static final String OPTION_STYLESHEET = '-stylesheet'
  private static final String DEFAULT_DIRECTORY = '.'
  private static final String DEFAULT_STYLESHEET = './spring-summary.css'

  private static String[][] options

  public static boolean start(RootDoc root) {
    ErrorReporter.setErrorReporter(root)

    options = root.options()

    def outputDirectory = getOption(OPTION_DIRECTORY) ?: DEFAULT_DIRECTORY
    def stylesheet = getOption(OPTION_STYLESHEET) ?: DEFAULT_STYLESHEET

    def outputFile = getOutputFile(outputDirectory)
    def collectors = getCollectors()

    new ClassProcessor().process root.classes(), collectors

    new HtmlWriter().writeOutput outputFile, collectors, stylesheet

    if (stylesheet == DEFAULT_STYLESHEET) {
      new StylesheetWriter().writeStylesheet outputDirectory, stylesheet
    }

    return true
  }

  private static getCollectors() {
    return [ new ComponentCollector(), new RequestMappingCollector() ]
  }

  private static File getOutputFile(String outputDirectory) {
    File path = new File(outputDirectory)
    if (!path.exists())
      path.mkdirs()

    def file = new File(path, "spring-summary.html")
    file.delete()
    file.createNewFile()

    return file
  }

  public static int optionLength(String option) {
    if (option.equals(OPTION_DIRECTORY)) {
      return 2
    } else if (option.equals(OPTION_STYLESHEET)) {
      return 2
    }
    return 0
  }

  private static String getOption(String optionName) {
    for (option in options) {
      if (option[0] == optionName) {
        return option[1]
      }
    }
    return null
  }
}
