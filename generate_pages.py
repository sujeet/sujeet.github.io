# This script is a primitive templating script.
# It does the following
# 1. Get all the files of form foo_content.html
# 2. Replace the <!-- content goes here --> in template.html with the innerhtml
#    of the div with id as "content"
# 3. Replace the <!-- additional links to css js here --> in template.html
#    with the innerhtml of the head tag
# 4. Save the file as foo.html


import os
from BeautifulSoup import BeautifulSoup



file_list = os.listdir(".")
file_list = [name for name in file_list if "_content.html" in name]
file_list = [name for name in file_list if "~" not in name]
template = open("template.html", 'r')
template_string = template.read()
template.close()
for file_name in file_list :
    f = open(file_name, 'r')
    data = f.read()
    f.close()
    soup = BeautifulSoup(data)
    head_contents = "\n" + "".join([str(x) for x in soup.head.contents]) + "\n"
    content_contents = "\n" + "".join([str(x) for x in soup.findAll(id="content")[0].contents]) + "\n"
    new_data = template_string.replace("<!-- content goes here -->", content_contents)
    new_data = new_data.replace("<!-- additional links to css js here -->", head_contents)
    new_file = open(file_name.replace("_content", ""), 'w')
    new_file.write(new_data)
    new_file.close()

