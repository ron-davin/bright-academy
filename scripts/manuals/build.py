"""Build Bright Academy role manuals (Admin, Teacher, Student) as PDFs."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Image, Table, TableStyle,
                                PageBreak, KeepTogether, NextPageTemplate)
from reportlab.platypus.tableofcontents import TableOfContents
from PIL import Image as PILImage

HERE = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(HERE, 'shots')
OUT = os.path.expanduser('~/bright-academy/manuals')
LOGO = os.path.expanduser('~/bright-academy/public/images/logo.png')
SITE = 'bright-academy-online.netlify.app'
os.makedirs(OUT, exist_ok=True)

F = '/System/Library/Fonts/Supplemental/'
pdfmetrics.registerFont(TTFont('Arial', F + 'Arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', F + 'Arial Bold.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Italic', F + 'Arial Italic.ttf'))
from reportlab.lib.fonts import addMapping
addMapping('Arial', 0, 0, 'Arial'); addMapping('Arial', 1, 0, 'Arial-Bold'); addMapping('Arial', 0, 1, 'Arial-Italic'); addMapping('Arial', 1, 1, 'Arial-Bold')

TEAL = colors.HexColor('#0078A0'); TEAL_LIGHT = colors.HexColor('#EEF7FA'); INK = colors.HexColor('#111827')
GRAY = colors.HexColor('#6B7280'); LINE = colors.HexColor('#E5E7EB'); AMBER_BG = colors.HexColor('#FFFBEB'); AMBER = colors.HexColor('#B45309')

S = {
    'h1': ParagraphStyle('h1', fontName='Arial-Bold', fontSize=19, leading=24, textColor=INK, spaceBefore=4, spaceAfter=8),
    'h2': ParagraphStyle('h2', fontName='Arial-Bold', fontSize=12.5, leading=17, textColor=TEAL, spaceBefore=10, spaceAfter=4),
    'body': ParagraphStyle('body', fontName='Arial', fontSize=10.5, leading=15.5, textColor=INK, spaceAfter=6),
    'step': ParagraphStyle('step', fontName='Arial', fontSize=10.5, leading=15, textColor=INK),
    'cap': ParagraphStyle('cap', fontName='Arial-Italic', fontSize=8.5, leading=11, textColor=GRAY, alignment=1, spaceBefore=3, spaceAfter=10),
    'tip': ParagraphStyle('tip', fontName='Arial', fontSize=9.8, leading=14, textColor=INK),
    'toc1': ParagraphStyle('toc1', fontName='Arial', fontSize=11.5, leading=20, textColor=INK),
}

class Doc(BaseDocTemplate):
    def __init__(self, path, role):
        super().__init__(path, pagesize=A4, leftMargin=2.2 * cm, rightMargin=2.2 * cm, topMargin=2.2 * cm, bottomMargin=2 * cm,
                         title=f'Bright Academy — {role} Manual', author='Bright Academy', subject=f'How to use Bright Academy as {role.lower()}')
        self.role = role
        fr = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id='f')
        self.addPageTemplates([PageTemplate('cover', [fr], onPage=self.cover_bg), PageTemplate('main', [fr], onPage=self.chrome)])
    def cover_bg(self, c, d):
        c.saveState(); c.setFillColor(TEAL); c.rect(0, 0, A4[0], 1.1 * cm, stroke=0, fill=1); c.restoreState()
    def chrome(self, c, d):
        c.saveState()
        c.setStrokeColor(LINE); c.setLineWidth(0.6); c.line(2.2 * cm, A4[1] - 1.5 * cm, A4[0] - 2.2 * cm, A4[1] - 1.5 * cm)
        c.setFont('Arial-Bold', 8.5); c.setFillColor(TEAL); c.drawString(2.2 * cm, A4[1] - 1.25 * cm, 'Bright Academy')
        c.setFont('Arial', 8.5); c.setFillColor(GRAY); c.drawRightString(A4[0] - 2.2 * cm, A4[1] - 1.25 * cm, f'{self.role} Manual')
        c.drawCentredString(A4[0] / 2, 1.1 * cm, str(d.page))
        c.restoreState()
    def afterFlowable(self, f):
        if isinstance(f, Paragraph) and f.style.name == 'h1':
            self.notify('TOCEntry', (0, f.getPlainText(), self.page))

JPG = os.path.join(HERE, 'shots_jpg'); os.makedirs(JPG, exist_ok=True)
def jpg(name, crop_top=0.0):
    out = os.path.join(JPG, f'{name}-{int(crop_top*100)}.jpg')
    if not os.path.exists(out):
        im = PILImage.open(os.path.join(SHOTS, name + '.png')).convert('RGB')
        if crop_top: im = im.crop((0, int(im.height * crop_top), im.width, im.height))
        if im.width > 1800: im = im.resize((1800, int(im.height * 1800 / im.width)), PILImage.LANCZOS)
        im.save(out, quality=85, optimize=True)
    return out

def img(name, width=16.6 * cm, caption=None, max_h=11.5 * cm, crop_top=0.0):
    path = jpg(name, crop_top)
    w, h = PILImage.open(path).size
    height = width * h / w
    if height > max_h: width, height = width * max_h / height, max_h
    t = Table([[Image(path, width=width, height=height)]], style=[('BOX', (0, 0), (-1, -1), 0.6, LINE), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 0)])
    parts = [t] + ([Paragraph(caption, S['cap'])] if caption else [Spacer(1, 10)])
    return KeepTogether(parts)

def dlg(name, caption=None, width=11 * cm, max_h=17 * cm, crop_top=0.0):
    return img(name, width=width, caption=caption, max_h=max_h, crop_top=crop_top)

def phones(names, caption=None):
    cells = []
    for n in names:
        path = jpg(n); w, h = PILImage.open(path).size; width = 5.4 * cm
        cells.append(Table([[Image(path, width=width, height=width * h / w)]], style=[('BOX', (0, 0), (-1, -1), 0.6, LINE), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 0)]))
    row = Table([cells], style=[('ALIGN', (0, 0), (-1, -1), 'CENTER'), ('VALIGN', (0, 0), (-1, -1), 'TOP')])
    return KeepTogether([row] + ([Paragraph(caption, S['cap'])] if caption else []))

def steps(items):
    rows = []
    for i, t in enumerate(items, 1):
        num = Table([[Paragraph(f'<font color="white"><b>{i}</b></font>', ParagraphStyle('n', fontName='Arial-Bold', fontSize=9, alignment=1, leading=11))]],
                    colWidths=[0.6 * cm], rowHeights=[0.6 * cm], style=[('BACKGROUND', (0, 0), (-1, -1), TEAL), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('ROUNDEDCORNERS', [8, 8, 8, 8]), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 0)])
        rows.append([num, Paragraph(t, S['step'])])
    return Table(rows, colWidths=[0.95 * cm, None], style=[('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 6), ('TOPPADDING', (1, 0), (1, -1), 1)], hAlign='LEFT')

def tip(text, kind='tip'):
    bg, fg, label = (TEAL_LIGHT, TEAL, 'Tip') if kind == 'tip' else (AMBER_BG, AMBER, 'Important')
    p = Paragraph(f'<font color="{fg.hexval()}" name="Arial-Bold">{label}: </font>{text}', S['tip'])
    return Table([[p]], colWidths=[None], style=[('BACKGROUND', (0, 0), (-1, -1), bg), ('LEFTPADDING', (0, 0), (-1, -1), 10), ('RIGHTPADDING', (0, 0), (-1, -1), 10), ('TOPPADDING', (0, 0), (-1, -1), 7), ('BOTTOMPADDING', (0, 0), (-1, -1), 8), ('LINEBEFORE', (0, 0), (0, -1), 3, fg)], hAlign='LEFT')

def kv(rows):
    data = [[Paragraph(f'<b>{a}</b>', S['step']), Paragraph(b, S['step'])] for a, b in rows]
    return Table(data, colWidths=[4.2 * cm, None], style=[('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LINEBELOW', (0, 0), (-1, -2), 0.5, LINE), ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5), ('LEFTPADDING', (0, 0), (-1, -1), 2)], hAlign='LEFT')

P = lambda t: Paragraph(t, S['body'])
H1 = lambda t: Paragraph(t, S['h1'])
H2 = lambda t: Paragraph(t, S['h2'])

def cover(role, who, intro):
    return [
        Spacer(1, 3.2 * cm), Image(LOGO, width=6.5 * cm, height=6.5 * cm * PILImage.open(LOGO).size[1] / PILImage.open(LOGO).size[0]), Spacer(1, 1.6 * cm),
        Paragraph(f'{role} Manual', ParagraphStyle('ct', fontName='Arial-Bold', fontSize=32, leading=38, textColor=INK, alignment=1)), Spacer(1, 0.4 * cm),
        Paragraph(who, ParagraphStyle('cs', fontName='Arial', fontSize=13, leading=18, textColor=GRAY, alignment=1)), Spacer(1, 1.4 * cm),
        Paragraph(intro, ParagraphStyle('ci', fontName='Arial', fontSize=11, leading=16, textColor=INK, alignment=1)), Spacer(1, 2.2 * cm),
        Paragraph(f'<font color="#0078A0"><b>{SITE}</b></font><br/>Version 2.0 · November 2026', ParagraphStyle('cu', fontName='Arial', fontSize=10.5, leading=16, textColor=GRAY, alignment=1)),
        NextPageTemplate('main'), PageBreak(),
    ]

def toc_page():
    toc = TableOfContents(); toc.levelStyles = [S['toc1']]; toc.dotsMinLevel = 0
    return [Paragraph('Contents', ParagraphStyle('ct2', parent=S['h1'])), Spacer(1, 6), toc, PageBreak()]

def build(fname, role, story_fn):
    path = os.path.join(OUT, fname)
    doc = Doc(path, role)
    doc.multiBuild(story_fn())
    print('built', path)

CLASSROOM = [
    H2('Inside the classroom'),
    kv([('Microphone / Camera', 'Turn your sound or video on and off. Red means it is off.'),
        ('Share screen', 'Show your screen (slides, a worksheet, code) to everyone.'),
        ('Record', 'Saves a recording of the lesson to your own computer.'),
        ('Red phone', 'Leave the class.'),
        ('Chat', 'Send short messages to everyone in the class.'),
        ('Board', 'A shared whiteboard — everyone sees what is drawn, live.'),
        ('People', 'Who is in the room (teachers also mark attendance here).'),
        ('Topic', 'Today’s lesson topic and homework.'),
        ('Open in Jitsi (top right)', 'A backup video room if video will not connect.')]),
    Spacer(1, 8),
]

# =====================================================================
def admin_story():
    s = cover('Admin', 'For the academy owner and office staff',
              'How to add teachers and students, build the weekly schedule,<br/>handle changes and answer free-trial requests.')
    s += toc_page()
    s += [H1('1. Logging in'),
          P(f'Open <b>{SITE}</b> and click <b>Log in</b> (top right). Enter the admin email and password. You land on the <b>Schedule</b>.'),
          img('login', 12 * cm, 'The login page. Everyone — admin, teachers and students — logs in here.'),
          tip('Change the admin password the first time you log in: <b>Settings › Change password</b>. Use at least 8 characters.', 'important'),
          H2('Your menu'),
          kv([('Schedule', 'The weekly calendar for the whole academy. Create and change classes here.'),
              ('Classes', 'A list of every recurring class. Edit, pause, resume or delete.'),
              ('Subjects', 'What the academy teaches. Add new subjects, edit or hide existing ones.'),
              ('People', 'Students, teachers and admins. Create accounts, reset passwords, set availability.'),
              ('Requests', 'Free-trial requests sent from the website. The number shows new requests.'),
              ('Settings', 'Your own name, phone and password.')]),
          PageBreak(),

          H1('2. Adding people'),
          P('Only the admin can create accounts. There is no public sign-up — this keeps the academy private and safe.'),
          H2('Add a student or teacher'),
          steps(['Open <b>People</b> and pick the tab: <b>Students</b>, <b>Teachers</b> or <b>Admins</b>.',
                 'Click <b>Add student</b> / <b>Add teacher</b> (top right).',
                 'Type the full name and email. A password is already filled in — click <b>New</b> for a different one, or type your own (8+ characters).',
                 'Teachers: tap the <b>subjects they teach</b>. Students: add age, grade and notes (for example a parent’s phone number).',
                 'Click <b>Create</b>. The next screen shows the login details — click <b>Copy</b> and send them to the person (WhatsApp, email, SMS).']),
          dlg('admin-add-person', caption='Adding a teacher. The subjects you choose decide which classes they can be given. New subjects are added on the Subjects page.'),
          tip('The password is only shown once. If it is lost, use <b>Password</b> on the person’s row to set a new one.'),
          img('admin-people-teachers', caption='People › Teachers. Each row has Edit, Availability, Password and Deactivate.'),
          H2('Teacher availability'),
          P('Click <b>Availability</b> on a teacher’s row to set the weekly hours they can teach. Teachers can also set this themselves. Availability is shown as light shading on the schedule and the class form warns you if a class is outside it.'),
          dlg('admin-availability', width=13 * cm, caption='Weekly availability. Use “Add hours” for each day and the bin icon to remove hours.'),
          PageBreak(),

          H1('3. Creating a class'),
          P('A <b>class</b> is a recurring lesson: one subject, one teacher, one or more students, on fixed weekly days and times. One student = one-on-one; several = a group class.'),
          steps(['Go to <b>Schedule</b> and click <b>New class</b>. (Shortcut: click an empty time on the calendar — the day and time are filled in for you.)',
                 '<b>Subject</b> — tap it. The teacher list then shows only teachers who teach that subject.',
                 '<b>Teacher</b> — choose from the list.',
                 '<b>Students</b> — tick one or more. Use the search box for long lists.',
                 '<b>Weekly times</b> — choose day, start time and length. Click <b>Add another day</b> for classes that meet more than once a week.',
                 '<b>Starts on</b> — the first date. <b>Ends on</b> is optional (leave empty for ongoing classes).',
                 'Check the box at the bottom, then click <b>Create class</b>.']),
          dlg('admin-newclass', 'The New class form. The green line at the bottom confirms there are no clashes.', width=12 * cm, max_h=14.2 * cm),
          H2('Clash checking'),
          P('Before saving, the form checks the next 8 weeks. If the teacher or any student already has a class at that time, it shows who and when, and <b>Create class</b> stays disabled until you choose another time.'),
          dlg('admin-conflict', crop_top=0.55, width=12 * cm, caption='A double booking: Daniel Cruz already teaches at Monday 4:00 PM, so the class cannot be saved.'),
          tip('Saving creates the sessions for the next 8 weeks. The schedule keeps topping itself up automatically — you never have to “extend” a class.'),
          PageBreak(),

          H1('4. Reading the schedule'),
          P('The <b>Schedule</b> shows one week at a time. Each coloured block is one session; the colour is the subject (the key is under the calendar). Use <b>Today</b> and the arrows to change week.'),
          img('admin-schedule', caption='The academy schedule. Each block shows the time, subject, teacher and students.'),
          P('Use the filters above the calendar to see one <b>teacher</b>, one <b>student</b> or one <b>subject</b>. When a teacher is selected, their available hours are shaded.'),
          img('admin-schedule-filter', caption='Filtered to one teacher. Shaded areas are the hours they are available.'),
          PageBreak(),

          H1('5. Changing a session'),
          P('Click any session on the calendar to open it. Changes here affect <b>only that one day</b> — the rest of the class stays the same.'),
          dlg('admin-session-panel', 'A session’s details and actions.'),
          kv([('Move this session', 'Pick a new date, time and length. Clashes are checked before you can save.'),
              ('Change teacher', 'Give this one session to a substitute teacher.'),
              ('Cancel session', 'Cancels this day only. Students see a “Cancelled” notice. Use <b>Restore session</b> to undo.'),
              ('Edit whole class', 'Opens the class form to change the regular days, times, teacher or students.'),
              ('Open classroom', 'Join the live room to observe a lesson.')]),
          Spacer(1, 8),
          dlg('admin-session-move', 'Moving a single session to another day or time.'),
          H2('Extra class'),
          P('Use <b>Extra class</b> (top of the Schedule) for a one-time lesson — a make-up class, a trial lesson or exam practice. Choose subject, teacher, students, date, time and length.'),
          dlg('admin-extra-class', 'Adding a one-time extra class.'),
          PageBreak(),

          H1('6. Managing classes'),
          P('<b>Classes</b> lists every recurring class with its teacher, students, weekly times and next session. Use the search box and the <b>Active / Paused / All</b> tabs.'),
          img('admin-classes', caption='The Classes list.'),
          kv([('Edit', 'Change subject, teacher, students, days, times or dates. Only <b>future</b> sessions change; past lessons keep their history.'),
              ('Pause', 'Stops the class (for example during holidays). Upcoming sessions are removed.'),
              ('Resume', 'Restarts a paused class and schedules its sessions again.'),
              ('Delete', 'Removes the class and its upcoming sessions. Past sessions stay in the history.')]),
          Spacer(1, 6),
          tip('To add a new student to an existing group, open <b>Edit</b> and tick their name. They join from the next session onwards.'),
          PageBreak(),

          H1('7. Subjects'),
          P('<b>Subjects</b> lists everything the academy teaches. Each card shows how many teachers teach the subject and how many active classes it has. Subjects appear on the homepage, in the free-trial form and in the <b>New class</b> form.'),
          img('admin-subjects', caption='The Subjects page.'),
          H2('Add a subject'),
          steps(['Open <b>Subjects</b> and click <b>Add subject</b> (top right).',
                 'Type the <b>name</b>, for example Piano or Chess.',
                 'Write a <b>short description</b> — one sentence that visitors see on the homepage.',
                 'Pick a <b>colour</b> and an <b>icon</b>. The preview at the bottom shows how it will look on the schedule.',
                 'Click <b>Add subject</b>. It appears straight away on the homepage and in the class forms.',
                 'Open <b>People › Teachers</b>, click <b>Edit</b> on each teacher who teaches it and tick the new subject.']),
          dlg('admin-add-subject', caption='Adding a new subject. The colour is used for its blocks on the schedule.', width=11 * cm, max_h=15 * cm),
          H2('Edit, hide or delete'),
          kv([('Edit', 'Change the name, description, colour or icon. Existing classes and sessions update automatically.'),
              ('Hide', 'Stops offering the subject: it disappears from the homepage, the free-trial form and the New class form. Classes already running carry on. Click <b>Show</b> to bring it back.'),
              ('Delete', 'Only for subjects you added that have never had a class. Built-in subjects can be hidden but not deleted.')]),
          Spacer(1, 6),
          tip('A new subject has no teachers yet. Until you tick it on at least one teacher, the New class form will show all teachers and a reminder.'),
          PageBreak(),

          H1('8. Free-trial requests'),
          P('Visitors fill in the <b>Book a free trial</b> form on the website. Each request appears in <b>Requests</b>, and the menu shows how many are new.'),
          img('public-trial', caption='The free-trial form on the public website.'),
          steps(['Open <b>Requests</b>. Contact the family by clicking their email, or call the phone number.',
                 'After the trial, click <b>Create student</b>. Name, email, phone, age and notes are filled in from the request — add a password and click Create.',
                 'Send the login details, then go to <b>Schedule › New class</b> to add the student to a class.',
                 'If you do not need to act on a request, click <b>Mark handled</b>. Tick <b>Show handled requests</b> to see older ones.']),
          img('admin-requests', caption='Requests from the website.'),
          PageBreak(),

          H1('9. Passwords and access'),
          kv([('Forgotten password', 'People › find the person › <b>Password</b> › <b>Set password</b>, then share the new details.'),
              ('Someone leaves', 'Click <b>Deactivate</b>. They can no longer log in; their history is kept. <b>Activate</b> brings them back.'),
              ('Change a name or email', 'People › <b>Edit</b>. A changed email becomes their new login.'),
              ('Your own password', '<b>Settings › Change password</b>.')]),
          Spacer(1, 8),
          dlg('admin-reset-password', width=9 * cm, caption='Setting a new password for a teacher.'),
          tip('The demo accounts (password <b>demo1234</b>) are for trying the app. Before real students join, deactivate them or give them new passwords.', 'important'),
          H1('10. Help and troubleshooting'),
          kv([('“Can’t reach the academy server”', 'The database was asleep or the internet dropped. Wait a minute and try again.'),
              ('A teacher is missing from the class form', 'Add the subject to the teacher in People › Edit.'),
              ('A subject is missing', 'It may be hidden. Open <b>Subjects</b> and click <b>Show</b>.'),
              ('Video will not connect', 'Ask everyone to refresh the page, allow camera and microphone, or use the <b>Open in Jitsi</b> button in the classroom.'),
              ('Someone cannot log in', 'Check they use the exact email from People, then reset their password.'),
              ('Need to see a lesson', 'Click the session › <b>Open classroom</b> to join as an observer.')]),
          ]
    return s

# =====================================================================
def teacher_story():
    s = cover('Teacher', 'For Bright Academy teachers',
              'How to see your classes, start a live lesson,<br/>add homework and attendance, and set your availability.')
    s += toc_page()
    s += [H1('1. Logging in'),
          P(f'Open <b>{SITE}</b> and click <b>Log in</b>. Use the email and password the academy sent you. You arrive on <b>Today</b>.'),
          img('login-teacher', 12 * cm, 'The login page.'),
          tip('Change your password after your first login: <b>Settings › Change password</b>.', 'important'),
          H2('Your menu'),
          kv([('Today', 'Your next class and today’s lessons.'),
              ('Schedule', 'Your week on a calendar.'),
              ('Students', 'Everyone you teach, their classes and attendance.'),
              ('Availability', 'The hours you can teach each week.'),
              ('Settings', 'Your name, phone and password.')]),
          PageBreak(),

          H1('2. Today'),
          P('<b>Today</b> shows your next class at the top, with the time, subject and students. Below are today’s lessons and what is coming up.'),
          img('teacher-today', caption='The Today screen.'),
          tip('The <b>Start class</b> button appears 10 minutes before the lesson begins. Until then you can open <b>Lesson notes</b> to prepare.'),
          PageBreak(),

          H1('3. Teaching a live class'),
          steps(['Up to 10 minutes before the lesson, click <b>Start class</b> (on Today, or inside the lesson on your Schedule).',
                 'Check the camera and microphone message and click <b>Start class &amp; join</b>.',
                 'When the browser asks, click <b>Allow</b> for the camera and microphone.',
                 'Your students join from their own Today screen. Their video appears next to yours.',
                 'When the lesson is over, click the red phone and choose <b>Yes, mark complete</b>.']),
          img('teacher-classroom-prejoin', caption='The screen before you join.'),
          img('classroom-in-room', caption='Inside the classroom: video on the left, chat, board, people and topic on the right. (A test camera picture is shown here.)'),
        ] + CLASSROOM + [
          img('classroom-whiteboard', caption='The shared whiteboard. Pick a colour, draw with the mouse or finger, and use the bin to clear it.'),
          tip('If video does not connect (for example on a strict school or office network), click the <b>Open in Jitsi</b> icon at the top right — everyone who clicks it meets in the same backup room.'),
          PageBreak(),

          H1('4. Lesson notes, homework and attendance'),
          P('Click any lesson (on Today or your Schedule) to open its notes.'),
          steps(['<b>Lesson topic</b> — what you are teaching, for example “Adding fractions”.',
                 '<b>Homework</b> — what the student should practise. Students see this on their Today screen straight away.',
                 '<b>Attendance</b> — after the lesson has started, mark each student <b>Present</b> or <b>Absent</b>.',
                 'Click <b>Save</b>.']),
          dlg('teacher-lesson-notes', 'Lesson notes: topic, homework and attendance.'),
          PageBreak(),

          H1('5. Your schedule'),
          P('<b>Schedule</b> shows your week. Use <b>Today</b> and the arrows to move between weeks. Light shading shows your available hours. Click a lesson to open its notes or start it.'),
          img('teacher-schedule', caption='Your week. Each block is one lesson.'),
          tip('The academy admin creates and changes classes. If you need a lesson moved or cancelled, message the admin — your schedule updates automatically.'),
          H1('6. Your students'),
          P('<b>Students</b> lists everyone you teach, with their age or grade, their classes and how many past lessons they attended.'),
          img('teacher-students', caption='Your students.'),
          PageBreak(),

          H1('7. Setting your availability'),
          P('Tell the academy which hours you can teach. The admin uses this when creating your classes.'),
          steps(['Open <b>Availability</b>.',
                 'For each day, click <b>Add hours</b> and choose the start and end time. Add more than one block if needed (for example morning and evening).',
                 'Use the bin icon to remove hours.',
                 'Click <b>Save</b> (top right).']),
          img('teacher-availability', caption='Weekly availability.'),
          H1('8. Help'),
          kv([('The Start button is missing', 'It appears 10 minutes before the lesson. Refresh the page if it does not appear.'),
              ('Students cannot hear or see me', 'Check the microphone and camera buttons are not red, and that the browser has permission (padlock icon in the address bar).'),
              ('No sound from a student', 'If you see “Tap for sound”, click it.'),
              ('Forgot your password', 'Ask the academy admin to set a new one.'),
              ('Wrong class time', 'Ask the admin — only the admin can change the schedule.')]),
          ]
    return s

# =====================================================================
def student_story():
    s = cover('Student', 'For students (and parents helping them)',
              'How to log in, join your live class,<br/>see your homework and check your schedule.')
    s += toc_page()
    s += [H1('1. Logging in'),
          P(f'Open <b>{SITE}</b> on a computer, tablet or phone and click <b>Log in</b>. Type the email and password the academy gave you.'),
          img('login-student', 12 * cm, 'The login page.'),
          tip('Ask a parent to help you change your password the first time: <b>Settings › Change password</b>.'),
          H2('Your menu'),
          kv([('Today', 'Your next class, the Join button and your homework.'),
              ('Schedule', 'All your classes for the next 3 weeks.'),
              ('My classes', 'Your subjects and teachers.'),
              ('Settings', 'Your name and password.')]),
          PageBreak(),

          H1('2. Today'),
          P('<b>Today</b> shows your next class: the subject, the time and your teacher. Underneath is your <b>homework</b>. If a class was cancelled, you will see a red notice.'),
          img('student-today', caption='The Today screen on a computer.'),
          phones(['student-mobile-today', 'student-mobile-schedule'], 'On a phone, the menu is at the bottom of the screen.'),
          PageBreak(),

          H1('3. Joining your class'),
          steps(['Open <b>Today</b> a few minutes before class.',
                 'The green <b>Join class</b> button appears 10 minutes before the lesson. Click it.',
                 'Click <b>Join the session</b>.',
                 'When the browser asks, click <b>Allow</b> so your teacher can see and hear you.',
                 'If your teacher is not there yet, you will see “Waiting for your teacher to join”. Stay on the page.',
                 'When the lesson ends, click the red phone to leave.']),
          img('student-classroom-prejoin', caption='Click “Join the session”.'),
          img('classroom-in-room', caption='Inside the classroom. Your video is on the left; chat and the whiteboard are on the right. (A test camera picture is shown here.)'),
        ] + CLASSROOM + [
          img('classroom-chat', caption='Sending a chat message to the class.'),
          tip('Use headphones if you can — your teacher will hear you more clearly. If you see “Tap for sound”, tap it.'),
          PageBreak(),

          H1('4. Homework'),
          P('Your teacher adds homework after (or before) each lesson. It appears on <b>Today</b> with the subject and the day of the class. Do it before your next lesson!'),
          H1('5. Your schedule and classes'),
          P('<b>Schedule</b> lists your classes for the next 3 weeks, day by day. <b>My classes</b> shows each subject, your teacher and your weekly times.'),
          img('student-schedule', caption='Your schedule.'),
          img('student-classes', caption='My classes.'),
          H1('6. Help'),
          kv([('I can’t see the Join button', 'It appears 10 minutes before class. Refresh the page if it still does not show.'),
              ('My teacher can’t hear me', 'Check the microphone button is not red, and allow the microphone in the browser.'),
              ('Video does not work', 'Refresh the page. If it still fails, click the <b>Open in Jitsi</b> icon at the top right of the classroom.'),
              ('I forgot my password', 'Ask the academy — they will give you a new one.'),
              ('I need to change a class time', 'Ask your parent to message the academy.')]),
          ]
    return s

import sys
ONLY = sys.argv[1].lower() if len(sys.argv) > 1 else None  # e.g. `python3 build.py admin`
for role, fn in [('Admin', admin_story), ('Teacher', teacher_story), ('Student', student_story)]:
    if not ONLY or ONLY == role.lower():
        build(f'Bright-Academy-{role}-Manual.pdf', role, fn)
