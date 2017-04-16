.. _compile_vision:

Compilation
============

First of all, it's necessary to install `git` for it doesn't come packaged with Ubuntu.

.. code-block:: bash
    
    sudo apt-get install git

Then, clone the repository to the `vision` folder.

.. code-block:: bash

    git clone https://github.com/unball/vision.git ~/vision

Finally, let's create a symbolic link to the configured catkin workspace in order to make it properly build our package. Make sure the paths are correctly configured.

.. code-block:: bash

    ln -s ~/vision ~/catkin_ws/src/vision

By this time, you should be able to compile the UnBall source code. This is easy done in your catkin workspace.

.. code-block:: bash
    
    cd ~/catkin_ws
    catkin_make --pkg vision

At this point you're ready to run vision code, see :doc:`running_vision`