/* HORUS OS — Calamares install slideshow */
import QtQuick 2.0
import calamares.slideshow 1.0

Presentation {
    id: presentation

    Timer {
        interval: 18000
        running: presentation.activatedInCalamares
        repeat: true
        onTriggered: presentation.goToNextSlide()
    }

    Slide {
        Text {
            anchors.centerIn: parent
            color: "#c9a227"
            font.pixelSize: 26
            horizontalAlignment: Text.AlignHCenter
            text: "HORUS OS — Intelligence Awakened\n\nThe Egyptian AI & Robotics Linux Distribution"
        }
    }
    Slide {
        Text {
            anchors.centerIn: parent
            color: "#e8e8f0"
            font.pixelSize: 22
            horizontalAlignment: Text.AlignHCenter
            text: "Plug in an Arduino or ESP32 — it just works.\nhorus-robotics · horus-setup · horus-doctor"
        }
    }
    Slide {
        Text {
            anchors.centerIn: parent
            color: "#00d4ff"
            font.pixelSize: 22
            horizontalAlignment: Text.AlignHCenter
            text: "A local AI assistant, project templates,\nand a premium desktop — out of the box."
        }
    }
}
