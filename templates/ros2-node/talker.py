"""
HORUS OS — ROS 2 starter node (rclpy)
A minimal publisher that emits a "HORUS" heartbeat on /horus/chatter.

Run (after sourcing ROS 2):
    source /opt/ros/humble/setup.bash
    python3 talker.py
Listen:
    ros2 topic echo /horus/chatter
"""
import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class Talker(Node):
    def __init__(self) -> None:
        super().__init__("horus_talker")
        self.pub = self.create_publisher(String, "/horus/chatter", 10)
        self.i = 0
        self.create_timer(1.0, self.tick)

    def tick(self) -> None:
        msg = String()
        msg.data = f"HORUS heartbeat {self.i}"
        self.pub.publish(msg)
        self.get_logger().info(f"publishing: {msg.data}")
        self.i += 1


def main() -> None:
    rclpy.init()
    node = Talker()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
